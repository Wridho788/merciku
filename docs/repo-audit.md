# Repository Audit — 2026-10-09

Snapshot of repository hygiene checks: secrets, ignored files, dependencies, licensing, and git history. Commit history was **not** rewritten (no rebase, squash, or force push), so every existing SHA is unchanged.

## 1. Secrets

### OneSignal REST API key (exposed — rotation required)

| | |
| --- | --- |
| File | `src/services/oneSignalService.ts` (constant `ONESIGNAL_REST_API_KEY`) |
| Introduced | `b8b9500` "add onesignal push notif" (2025-12-06) |
| Present in | Every later commit on `master` up to `2b23934`, and branch `refactoring_api` |
| Remote | `github.com/Wridho788/merciku` and `github.com/Wridho788/lapakbenz` are both public and share this history, so the key should be treated as leaked |
| Impact | A REST API key can send push notifications to all subscribers of the app |
| Current tree | File removed on `chore/repo-hygiene`. It was not imported anywhere, so the built bundle never contained the key |

**Required action (owner):** rotate the key in OneSignal Dashboard → Settings → Keys & IDs. Once rotated, the value left in history is useless.

**History:** left intact on purpose. The file is recorded here as a known exception (Clause 8) instead of rewriting history. If history ever has to be rewritten, InfoBay must be notified first.

The OneSignal **App ID** (`src/hooks/useOneSignal.ts`) is a public identifier by design and is not a secret.

### Hardcoded test login (review)

`src/pages/Login.tsx` defines a development helper `fillTestCredentials()` containing a phone number and password. It is only attached to `window` when `import.meta.env.DEV` is true, but the values are committed. If this is a real account, change its password.

### Other checks

- No `.env`, private key, certificate, or credential file has ever been committed (checked across all commits with `git log --all --diff-filter=A`).
- No AWS, Google, Stripe, Slack, or GitHub token patterns were found in any commit.

## 2. Ignored files

`.gitignore` now covers `node_modules`, `dist`, `dist-ssr`, `build`, `*.tsbuildinfo`, `.env` / `.env.*` (except `.env.example`), `.cache`, `.vite`, `.eslintcache`, `coverage`, and `.claude/settings.local.json`.

`git ls-files -ci --exclude-standard` returns nothing: no ignored file is tracked. `node_modules` and `dist` have never been committed.

## 3. Dependencies

`pnpm audit` (pnpm 11.9.0) reported **"No known vulnerabilities found"**, but its metadata showed only 9 dependencies against 724 distinct packages in `pnpm-lock.yaml`. That result is not reliable.

Cross-check: every package and version from `pnpm-lock.yaml` was sent to the npm registry bulk advisory endpoint (`/-/npm/v1/security/advisories/bulk`, the same source `npm audit` uses).

**Result: 133 advisories across 35 packages: 2 critical, 72 high, 53 moderate, 6 low.**

| Package (locked) | Reaches | Advisories | Fixed in |
| --- | --- | --- | --- |
| `axios` 1.11.0 | Browser bundle (direct) | 12 high, 19 moderate, 1 low | ≥ 1.20.0 |
| `react-router` 7.8.1 (via `react-router-dom`) | Browser bundle (direct) | 8 high, 6 moderate | ≥ 7.18.0 |
| `vite` 7.1.3 | Dev server and build only | 3 high, 3 moderate, 2 low | ≥ 7.3.5 |
| `proxy-addr` 2.0.7, `path-to-regexp` 0.1.10, `body-parser`, `qs` (via `express` 4.21.1) | Optional `scripts/server.mjs` only | 1 critical, 2 high, 3 moderate, 2 low | Upgrade `express` 4.x |
| `basic-ftp` 5.0.5 (via `puppeteer`) | Dev tooling only | 1 critical, 4 high | Upgrade `puppeteer` |
| Others (`minimatch`, `brace-expansion`, `rollup`, `postcss`, `ws`, …) | Build and lint tooling | remainder | Lockfile refresh |

Context:

- The app is a client-only SPA. Many `axios` advisories target its Node.js HTTP adapter and proxy handling, and many `react-router` advisories target SSR/RSC framework mode. Neither path runs in the browser, so actual exposure is lower than the raw count. The open-redirect and prototype-pollution items still apply and are worth fixing.
- Most remaining packages are build-time only and never ship to users.

**Recommended follow-up (separate PR):** bump `axios`, `react-router-dom`, `vite`, `express`, and `puppeteer`, refresh the lockfile, then run `pnpm build` and smoke-test.

## 4. License

Added `LICENSE` (proprietary, all rights reserved, © 2025–2026 Wridho788) and `"license": "UNLICENSED"` in `package.json`.

## 5. Git history

| Check | Result |
| --- | --- |
| Commits (all refs) | 180, from 2025-08-20 to 2026-09-17 (before this branch) |
| Authors (`git shortlog -sne --all`) | One identity: `dHustler997 <wridho246@gmail.com>`, 180 commits. No aliases to record |
| GitHub account | Remote owner is `Wridho788`; commit author name is `dHustler997`. If both are the same person, record `dHustler997` as an alias of `Wridho788` |
| Repo size (`git count-objects -vH`) | 6.10 MiB loose objects, no packs |
| Largest blob | `public/manohara-w202-03-jul-24.png` (~530 KB). No large binaries |
| Tags | `v1.1.0` |
| Remotes | `origin` → `Wridho788/merciku`, `origin_lapakbenz` → `Wridho788/lapakbenz` |

## 6. Workflow going forward

Make changes on a branch and land them through a pull request with a real description, merged with a merge commit (no squash or rebase merges), so commit SHAs are kept. Version tags such as `v1.2.0` can mark snapshots without changing history.
