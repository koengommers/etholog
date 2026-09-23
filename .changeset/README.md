# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): one
markdown file per unreleased change, describing which packages it affects and how
much to bump them. Merging them is what produces a release.

Add one with `pnpm changeset`, commit it alongside your change, and the release
workflow does the rest.

## House rules

- **All four packages are versioned in lockstep** (`fixed` in `config.json`), so
  they always share a version number and transports' `workspace:^` peer ranges are
  always satisfied. Selecting one package in the prompt bumps them all.
- **Never choose `major` before 1.0.** Breaking changes take `minor`. A `major`
  changeset would take every package straight to 1.0.0, and 1.0 is a deliberate
  decision, not a prompt selection.
- Changes with no user-visible effect (CI, tooling, internal refactors) need no
  changeset — use `pnpm changeset --empty` if a PR needs one to pass CI.
