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
- Then:

```bash
git add <files>
git rebase --continue
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
