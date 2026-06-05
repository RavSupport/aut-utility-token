use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Mint, Token, TokenAccount, TransferChecked,
};

declare_id!("4kp8deHBoE6FQ7C3PD4QJ8Sw6rc9cSyJGtDxdBhwDmv2");

const REWARD_SCALE: u128 = 1_000_000_000_000;

#[program]
pub mod utility_staking {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        reward_rate_per_token_per_second_scaled: u128,
    ) -> Result<()> {
        require!(
            ctx.accounts.stake_vault.owner == ctx.accounts.pool_signer.key(),
            StakingError::InvalidVaultOwner
        );
        require!(
            ctx.accounts.reward_vault.owner == ctx.accounts.pool_signer.key(),
            StakingError::InvalidVaultOwner
        );

        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.stake_mint = ctx.accounts.stake_mint.key();
        pool.reward_mint = ctx.accounts.reward_mint.key();
        pool.stake_vault = ctx.accounts.stake_vault.key();
        pool.reward_vault = ctx.accounts.reward_vault.key();
        pool.reward_rate_per_token_per_second_scaled = reward_rate_per_token_per_second_scaled;
        pool.total_staked = 0;
        pool.last_update_ts = Clock::get()?.unix_timestamp;
        pool.acc_reward_per_token_scaled = 0;
        pool.bump = ctx.bumps.pool;
        pool.signer_bump = ctx.bumps.pool_signer;
        Ok(())
    }

    pub fn initialize_position(ctx: Context<InitializePosition>) -> Result<()> {
        let position = &mut ctx.accounts.position;
        position.owner = ctx.accounts.owner.key();
        position.pool = ctx.accounts.pool.key();
        position.amount = 0;
        position.reward_debt_scaled = 0;
        position.pending_rewards = 0;
        position.bump = ctx.bumps.position;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::ZeroAmount);
        update_pool(&mut ctx.accounts.pool)?;
        accrue_position(&ctx.accounts.pool, &mut ctx.accounts.position)?;

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.owner_stake_account.to_account_info(),
            mint: ctx.accounts.stake_mint.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts);
        token::transfer_checked(cpi_ctx, amount, ctx.accounts.stake_mint.decimals)?;

        ctx.accounts.position.amount = ctx.accounts.position.amount
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;
        ctx.accounts.pool.total_staked = ctx.accounts.pool.total_staked
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;
        sync_reward_debt(&ctx.accounts.pool, &mut ctx.accounts.position)
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::ZeroAmount);
        require!(ctx.accounts.position.amount >= amount, StakingError::InsufficientStake);
        update_pool(&mut ctx.accounts.pool)?;
        accrue_position(&ctx.accounts.pool, &mut ctx.accounts.position)?;

        ctx.accounts.position.amount = ctx.accounts.position.amount
            .checked_sub(amount)
            .ok_or(StakingError::MathOverflow)?;
        ctx.accounts.pool.total_staked = ctx.accounts.pool.total_staked
            .checked_sub(amount)
            .ok_or(StakingError::MathOverflow)?;

        let stake_mint = ctx.accounts.pool.stake_mint;
        let reward_mint = ctx.accounts.pool.reward_mint;
        let seeds = &[
            b"pool-signer",
            stake_mint.as_ref(),
            reward_mint.as_ref(),
            &[ctx.accounts.pool.signer_bump],
        ];
        let signer = &[&seeds[..]];
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.stake_vault.to_account_info(),
            mint: ctx.accounts.stake_mint.to_account_info(),
            to: ctx.accounts.owner_stake_account.to_account_info(),
            authority: ctx.accounts.pool_signer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer,
        );
        token::transfer_checked(cpi_ctx, amount, ctx.accounts.stake_mint.decimals)?;

        sync_reward_debt(&ctx.accounts.pool, &mut ctx.accounts.position)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        update_pool(&mut ctx.accounts.pool)?;
        accrue_position(&ctx.accounts.pool, &mut ctx.accounts.position)?;

        let rewards = ctx.accounts.position.pending_rewards;
        require!(rewards > 0, StakingError::NoRewards);
        ctx.accounts.position.pending_rewards = 0;

        let stake_mint = ctx.accounts.pool.stake_mint;
        let reward_mint = ctx.accounts.pool.reward_mint;
        let seeds = &[
            b"pool-signer",
            stake_mint.as_ref(),
            reward_mint.as_ref(),
            &[ctx.accounts.pool.signer_bump],
        ];
        let signer = &[&seeds[..]];
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.reward_vault.to_account_info(),
            mint: ctx.accounts.reward_mint.to_account_info(),
            to: ctx.accounts.owner_reward_account.to_account_info(),
            authority: ctx.accounts.pool_signer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer,
        );
        token::transfer_checked(cpi_ctx, rewards, ctx.accounts.reward_mint.decimals)?;

        sync_reward_debt(&ctx.accounts.pool, &mut ctx.accounts.position)
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub stake_mint: Account<'info, Mint>,
    pub reward_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + Pool::INIT_SPACE,
        seeds = [b"pool", stake_mint.key().as_ref(), reward_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(
        seeds = [b"pool-signer", stake_mint.key().as_ref(), reward_mint.key().as_ref()],
        bump
    )]
    /// CHECK: PDA signer for vault authority.
    pub pool_signer: UncheckedAccount<'info>,
    #[account(mut, constraint = stake_vault.mint == stake_mint.key())]
    pub stake_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = reward_vault.mint == reward_mint.key())]
    pub reward_vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub pool: Account<'info, Pool>,
    #[account(
        init,
        payer = owner,
        space = 8 + Position::INIT_SPACE,
        seeds = [b"position", pool.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = owner, has_one = pool)]
    pub position: Account<'info, Position>,
    #[account(address = pool.stake_mint)]
    pub stake_mint: Account<'info, Mint>,
    #[account(mut, constraint = owner_stake_account.owner == owner.key(), constraint = owner_stake_account.mint == stake_mint.key())]
    pub owner_stake_account: Account<'info, TokenAccount>,
    #[account(mut, address = pool.stake_vault)]
    pub stake_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = owner, has_one = pool)]
    pub position: Account<'info, Position>,
    #[account(
        seeds = [b"pool-signer", pool.stake_mint.as_ref(), pool.reward_mint.as_ref()],
        bump = pool.signer_bump
    )]
    /// CHECK: PDA signer for vault authority.
    pub pool_signer: UncheckedAccount<'info>,
    #[account(address = pool.stake_mint)]
    pub stake_mint: Account<'info, Mint>,
    #[account(mut, constraint = owner_stake_account.owner == owner.key(), constraint = owner_stake_account.mint == stake_mint.key())]
    pub owner_stake_account: Account<'info, TokenAccount>,
    #[account(mut, address = pool.stake_vault)]
    pub stake_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut, has_one = owner, has_one = pool)]
    pub position: Account<'info, Position>,
    #[account(
        seeds = [b"pool-signer", pool.stake_mint.as_ref(), pool.reward_mint.as_ref()],
        bump = pool.signer_bump
    )]
    /// CHECK: PDA signer for vault authority.
    pub pool_signer: UncheckedAccount<'info>,
    #[account(address = pool.reward_mint)]
    pub reward_mint: Account<'info, Mint>,
    #[account(mut, constraint = owner_reward_account.owner == owner.key(), constraint = owner_reward_account.mint == reward_mint.key())]
    pub owner_reward_account: Account<'info, TokenAccount>,
    #[account(mut, address = pool.reward_vault)]
    pub reward_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub authority: Pubkey,
    pub stake_mint: Pubkey,
    pub reward_mint: Pubkey,
    pub stake_vault: Pubkey,
    pub reward_vault: Pubkey,
    pub reward_rate_per_token_per_second_scaled: u128,
    pub total_staked: u64,
    pub last_update_ts: i64,
    pub acc_reward_per_token_scaled: u128,
    pub bump: u8,
    pub signer_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub reward_debt_scaled: u128,
    pub pending_rewards: u64,
    pub bump: u8,
}

fn update_pool(pool: &mut Account<Pool>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    if now <= pool.last_update_ts {
        return Ok(());
    }

    if pool.total_staked == 0 {
        pool.last_update_ts = now;
        return Ok(());
    }

    let elapsed = u128::try_from(now - pool.last_update_ts)
        .map_err(|_| StakingError::MathOverflow)?;
    let reward_per_token = elapsed
        .checked_mul(pool.reward_rate_per_token_per_second_scaled)
        .ok_or(StakingError::MathOverflow)?;
    pool.acc_reward_per_token_scaled = pool.acc_reward_per_token_scaled
        .checked_add(reward_per_token)
        .ok_or(StakingError::MathOverflow)?;
    pool.last_update_ts = now;
    Ok(())
}

fn accrue_position(pool: &Account<Pool>, position: &mut Account<Position>) -> Result<()> {
    let accrued_scaled = u128::from(position.amount)
        .checked_mul(pool.acc_reward_per_token_scaled)
        .ok_or(StakingError::MathOverflow)?;
    let delta_scaled = accrued_scaled
        .checked_sub(position.reward_debt_scaled)
        .ok_or(StakingError::MathOverflow)?;
    let delta = delta_scaled
        .checked_div(REWARD_SCALE)
        .ok_or(StakingError::MathOverflow)?;
    let delta_u64 = u64::try_from(delta).map_err(|_| StakingError::MathOverflow)?;
    position.pending_rewards = position.pending_rewards
        .checked_add(delta_u64)
        .ok_or(StakingError::MathOverflow)?;
    Ok(())
}

fn sync_reward_debt(pool: &Account<Pool>, position: &mut Account<Position>) -> Result<()> {
    position.reward_debt_scaled = u128::from(position.amount)
        .checked_mul(pool.acc_reward_per_token_scaled)
        .ok_or(StakingError::MathOverflow)?;
    Ok(())
}

#[error_code]
pub enum StakingError {
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("The requested unstake amount exceeds the staked balance.")]
    InsufficientStake,
    #[msg("Arithmetic overflow or underflow.")]
    MathOverflow,
    #[msg("No rewards are available to claim.")]
    NoRewards,
    #[msg("Vault token account must be owned by the pool signer PDA.")]
    InvalidVaultOwner,
}
