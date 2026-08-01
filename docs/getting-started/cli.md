# CLI Reference

The executable is named `el`. The following invocations are the **complete
normative v1 command surface**:

```text
el --help
el --version
el check
el check --locked
el build
el build --release
el build --locked
el build --release --locked
el emit llvm-ir --module Main
```

## Project discovery

`check`, `build`, and `emit` use `el.toml` in the current directory when
present; otherwise they walk toward the filesystem root and use the nearest
ancestor containing one. A missing manifest is a project error. `--help` and
`--version` do not require a project.

## Commands

### `el check`

Resolves dependencies and type-checks every source declaration in the current
package. Stops there — no machine code is emitted.

- `--locked` — require the existing `el.lock` to remain unchanged.

### `el build`

Performs the same resolution and checking as `check`, then emits reachable code
for the package's single executable target. A library-only package reports that
no executable target exists.

- `--release` — enable optimization without changing language semantics.
- `--locked` — apply the lockfile rules.

`--release` and `--locked` may appear in either order after `build`; each may
appear at most once. Development builds include debug information and use low
optimization.

### `el emit llvm-ir --module <module>`

Performs the same resolution and checking as `check`, then writes the textual
LLVM IR of one package-relative module to standard output. Requires exactly one
`--module`. LLVM text and symbol names are diagnostic output, **not** a stable
language API.

## Conventions

- Diagnostics go to standard error. Successful `check` and `build` need not
  print anything on standard output.
- `--help` prints usage for every command to standard output; `--version`
  prints exactly `el <version>` plus one newline.
- Command names and options are case-sensitive.
- Options are command-local: v1 has no global project-directory, color,
  verbosity, target, or output-path flags.
- There is no `el run` or `el test` in v1 — execute the built native program
  directly and pass process arguments to it.
