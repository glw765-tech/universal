---
name: EAS build pnpm version fix
description: How to resolve ERR_PNPM_IGNORED_BUILDS on EAS when using a pnpm monorepo
---

## Rule
When EAS builds fail with `[ERR_PNPM_IGNORED_BUILDS]`, pin pnpm to the version that generated the lockfile by adding `"packageManager": "pnpm@<version>"` to the **root** `package.json`.

**Why:** EAS uses Corepack to pick the package manager. Without a `packageManager` field in the root `package.json`, EAS defaults to its latest pnpm (v10+), which has strict build-script enforcement. The lockfile is `lockfileVersion: '9.0'` (pnpm v9), so pnpm v10 mismatches and errors even when `ignoredBuiltDependencies: [esbuild]` is set in both `pnpm-workspace.yaml` and the lockfile settings section.

**How to apply:** Any time EAS install phase fails with `ERR_PNPM_IGNORED_BUILDS` or similar pnpm enforcement errors, check the lockfile version, match it to the correct pnpm major version, and set `packageManager` in the root `package.json`. The `PNPM_VERSION` env var in `eas.json` does NOT control which pnpm EAS uses — only the `packageManager` field does via Corepack.

## Project-specific values
- Lockfile: `lockfileVersion: '9.0'` → pnpm v9
- Fix applied: `"packageManager": "pnpm@9.15.4"` in root `package.json`
- Bundle ID: `com.orderuniverse.app`, Team ID: `7763W2PGP2`, App Store Connect App ID: `6796764798`
