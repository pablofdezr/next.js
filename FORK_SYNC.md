# Fork Sync Guide (canary)

This repo tracks the upstream `vercel/next.js` canary branch while keeping local
custom commits on top. These steps keep your fork up to date without losing your
changes.

## One-time setup

Ensure you have both remotes:

```bash
git remote -v
```

If `upstream` is missing:

```bash
git remote add upstream https://github.com/vercel/next.js.git
```

## Regular update (keep your commits)

1. Start clean

```bash
git status -sb
```

2. Make sure you are on canary (use Graphite for checkout)

```bash
gt checkout canary
```

3. Fetch upstream

```bash
git fetch upstream --tags
```

4. Rebase your canary on top of upstream canary

```bash
git rebase upstream/canary
```

5. Resolve conflicts if any

- Open files in VSCode and resolve `<<<<<<<` blocks.
- **Common Conflict: `packages/next/package.json`**:
  - You will likely conflict on `name` ("next-hybrid") and `version` (e.g., `16.1.1-hybrid.x`).
  - **Resolution**: Keep your custom name and your custom hybrid version. Do NOT revert to the upstream `next` name or `canary` version.
- Then:

```bash
git add <files>
# Use GIT_EDITOR="cat" to avoid opening an interactive editor for commit messages if you're automating or just want to accept the default.
GIT_EDITOR="cat" git rebase --continue
```

Repeat until the rebase finishes. If you need to skip a commit:

```bash
git rebase --skip
```

6. Push to your fork

If you rebased, the history changed, so force-push safely:

```bash
git push --force-with-lease origin canary
```

## Verify

You want to be only "ahead" of upstream:

```bash
git rev-list --left-right --count upstream/canary...canary
```

Expected result: `0 <n>` (0 behind, n ahead).

## Notes

- Avoid `git pull` on canary; use fetch + rebase to keep history clean.
- If the rebase repeatedly skips commits, that usually means they already exist
  upstream.
- **Dependencies**: After syncing, it's good practice to run `pnpm install` to ensure your lockfile matches any new upstream dependencies, though your rebase should ideally handle this if there were no conflicts in the lockfile.

## Publishing to NPM (`next-hybrid`)

Once you have synced with upstream and verified the changes, follow these steps to publish a new version of `next-hybrid`.

### 1. Ensure Internal Paths are Correct

Next.js uses hardcoded internal paths. Since we renamed the package to `next-hybrid`, we must ensure all internal references to `next/dist` are updated to `next-hybrid/dist`. This is required for the package to find its own bundles at runtime.

Run these commands in the root of the repo to fix any new upstream references:

```bash
# Update taskfile and config files
sed -i '' 's/"next\/dist/"next-hybrid\/dist/g' packages/next/taskfile.js
sed -i '' "s/'next\/dist/'next-hybrid\/dist/g" packages/next/taskfile.js
sed -i '' 's/"next\/dist/"next-hybrid\/dist/g' packages/next/next-runtime.webpack-config.js
sed -i '' 's/"next\/dist/"next-hybrid\/dist/g' packages/next/tsconfig.json

# Update all source files (src directory)
grep -rl "\"next/dist" packages/next/src | xargs sed -i '' 's/"next\/dist/"next-hybrid\/dist/g'
grep -rl "'next/dist" packages/next/src | xargs sed -i '' "s/'next\/dist/'next-hybrid\/dist/g"
```

### 2. Build the Package

Navigate to the `next` package and run the release build:

```bash
cd packages/next
pnpm run build
```

_Note: If `generate_types` fails, it is often due to strict type mismatches in the vendored dependencies after the rename. The build is configured to continue anyway._

### 3. Publish to NPM

Publish using the `latest` tag so that the README and package metadata are correctly updated on the NPM landing page. You can also use the `hybrid` tag if you want to keep it as a secondary release.

```bash
# Recommended: Publish as latest
pnpm publish --no-git-checks --tag latest --access public --no-provenance

# Optional: Publish with hybrid tag
pnpm publish --no-git-checks --tag hybrid --access public --no-provenance
```

## Summary of Hybrid Modifications

The following local changes are essential to keep `next-hybrid` working:

- **`package.json`**: Name changed to `next-hybrid`.
- **`taskfile.js`**: `generate_types` wrapped in try/catch to prevent build aborts on type errors.
- **`next-runtime.webpack-config.js`**: Fixed `externalsMap` and internal aliases to use absolute paths or the `next-hybrid` name.
- **`tsconfig.build.json`**: `skipLibCheck: true` and `strict: false` added to facilitate type generation for the renamed package.
- **`types/compiled.d.ts`**: Stubbed modules updated to use the `next-hybrid/dist/compiled/` prefix.
