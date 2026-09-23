# Contributing

## Getting started

The repository is a pnpm workspace. pnpm is pinned via `packageManager`, so
Corepack will pick up the right version automatically.

```bash
corepack enable
pnpm install
```

Packages are in `packages/`.

## Working on a change

### Add a changeset

Any pull request that changes a package needs a changeset describing the change
and how it should be released:

```bash
pnpm changeset
```

This writes a markdown file to `.changeset/`. Commit it with your change. CI
fails without one.

Pull requests touching no package at all (CI, root config, docs) don't need one.
If a package genuinely changed but shouldn't be released, use
`pnpm changeset --empty`.

**While the packages are at 0.x, choose `patch` for fixes and `minor` for
everything else, including breaking changes.** Do not choose `major` — it would
release 1.0.0 (see below).

## Releasing

Maintainers only. Releases are automated with
[changesets](https://github.com/changesets/changesets); there are no manual
version bumps.

The flow has two steps:

1. **Merge changes to `main`.** When any changesets are pending, the release
   workflow opens (or updates) a pull request titled *"chore: version packages"*.
   It bumps every package's version and writes the changelogs. It does not
   publish anything, and it stays open, accumulating changes, for as long as you
   like.
2. **Merge that pull request.** This is the release. The workflow publishes all
   four packages to npm, then creates one `vX.Y.Z` tag and one GitHub Release
   from the core changelog.

### Reaching 1.0

1.0.0 is cut by hand when the API is deliberately frozen — never by a changeset.
