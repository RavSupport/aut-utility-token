# Free Self-Publishing Plan

Date: 2026-06-04

## Best Free Path

Use GitHub Pages as the canonical public site, Cloudflare Pages as an optional mirror, and IPFS as an optional immutable snapshot.

This publishes the project website, research, localnet verification results, and source code. It does not publish a mainnet token.

## Why This Route

GitHub Pages is available for public repositories on GitHub Free and can publish from a repository branch or folder:

https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Cloudflare Pages has a Free plan with static site limits such as 20,000 files and 500 builds per month:

https://developers.cloudflare.com/pages/platform/limits/

IPFS can be used with a free-tier pinning service for immutable snapshots:

https://docs.ipfs.tech/quickstart/pin/

## What To Publish

Publish:

- `public/` static website
- `docs/research.md`
- `docs/security.md`
- `docs/validator-ops.md`
- `docs/readiness.md`
- `docs/localnet-results.md`
- source code

Do not publish:

- `.secrets/`
- private keys
- seed phrases
- `token.config.json`
- any treasury or validator withdrawer key

## GitHub Pages Steps

Fast path after GitHub authentication:

```powershell
C:\tmp\gh-cli\bin\gh.exe auth login
.\scripts\publish-github-pages.ps1 -RepositoryName aut-utility-token
```

Manual path:

1. Create a public GitHub repository.
2. Push this project to the repository.
3. In GitHub, open repository settings.
4. Go to Pages.
5. Set source to deploy from a branch.
6. Select the `main` branch and `/public` folder.
7. Save.
8. GitHub Pages will publish `public/index.html`.

## Cloudflare Pages Mirror

1. Create a Cloudflare Pages project.
2. Connect the same GitHub repository.
3. Set build command to blank.
4. Set output directory to `public`.
5. Deploy.

## IPFS Snapshot

Use IPFS only after the public copy is final, because snapshots are content-addressed and effectively permanent when pinned.

Suggested snapshot contents:

- `public/`
- `docs/`
- release notes
- localnet verification results

## Mainnet Publishing Is Different

Mainnet token deployment is not free. At minimum, it requires SOL for fees, wallet custody, metadata setup, treasury controls, and likely liquidity provisioning. Mainnet must remain blocked until legal and security review are complete.
