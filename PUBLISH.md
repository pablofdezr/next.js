# Publishing Guide for next-hybrid

This document outlines the steps and nuances required to publish `next-hybrid` to npm, ensuring it stays in sync with upstream Next.js while maintaining custom features like Hybrid Routing and AI Content Negotiation.

## Prerequisites

- **Access**: You must have publish access to the `next-hybrid` package on npm.
- **Dependencies**: Ensure `pnpm` is installed.
- **Environment**: You are working in the `canary` branch of your fork.

## Workflow

### 1. Sync with Upstream

Before publishing, ensure your fork is up-to-date with `vercel/next.js` canary branch to include the latest fixes and features.

Follow the detailed steps in `FORK_SYNC.md`:

1.  `git checkout canary`
2.  `git fetch upstream --tags`
3.  `git rebase upstream/canary`
4.  Resolve conflicts if any.
5.  `git push --force-with-lease origin canary`

### 2. Prepare the Release

1.  **Bump Version**: Update the `version` field in `packages/next/package.json`.
    - We follow a `hybrid` prerelease versioning (e.g., `16.1.1-hybrid.3`).
    - Ensure the base version matches the upstream version you just synced with.

2.  **Verify Experimental Exports**:
    - Check that `packages/next/experimental.d.ts` and `packages/next/experimental.js` exist.
    - Ensure they are included in the `files` array in `packages/next/package.json`.
    - These files enable importing from `next/experimental` (e.g., `ExperimentalAIContent`).

3.  **Build**:
    - Run `pnpm build` inside `packages/next`.
    - This executes `taskr release` which compiles the source code into `dist/`.
    - **Important**: Ensure `AI_CONTENT_MANIFEST` logic is integrated into `BaseServer.ts` and `build/index.ts` so that `ai-content-manifest.json` is generated and loaded.

### 3. Publish to npm

Run the publish command from `packages/next`:

```bash
cd packages/next
pnpm publish --tag canary --no-git-checks --no-provenance
```

**Nuances & Flags:**

- `--tag canary`: Essential because we are publishing a prerelease version. npm requires an explicit tag.
- `--no-git-checks`: Useful if the local git state isn't perfectly clean (e.g., untracked files) or if `pnpm` complains about branch status, but **use with caution**. Always try to commit changes first.
- `--no-provenance`: **CRITICAL** when publishing from a local machine. provenance generation typically requires a supported CI/CD environment (like GitHub Actions). If omitted locally, publishing will fail with `Automatic provenance generation not supported for provider: null`.

**Updating the Default (latest) Tag:**

By default, npm shows the version tagged as `latest`. If you want the version you just published to be the default one shown on the npm package page (and installed via `npm install next-hybrid`), you must promote it:

```bash
npm dist-tag add next-hybrid@<version> latest
```

Example:

```bash
npm dist-tag add next-hybrid@16.1.1-hybrid.5 latest
```

### 4. Verify

- Check the npm page: https://www.npmjs.com/package/next-hybrid
- Install in a test project: `npm install next@npm:next-hybrid`
- Verify new features (e.g., Hybrid Routing, AI Content Negotiation) work.

## Common Issues

- **"You must specify a tag using --tag"**: You forgot `--tag canary`.
- **"Automatic provenance generation not supported"**: You forgot `--no-provenance`.
- **Missing types**: Ensure `experimental.d.ts` is in the `files` list in `package.json`.
- **AI Content 404 in production**: Ensure `BaseServer.ts` overrides `prepareImpl` to load the `ai-content-manifest.json`.
