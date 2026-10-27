# CLI reference

`el` operates on packages; `elc` compiles one source file.

```text
el --help
el --version
el check [--locked]
el build [--release] [--locked]
el run [--release] [--locked] [-- <arguments>...]
el r [--release] [--locked] [-- <arguments>...]
el test [--release] [--locked] [--timeout <seconds>] [<filter>]
el fmt [--check] [<file.ell> | -]
el lsp
el emit llvm-ir --module <Module>

elc --help
elc --version
elc [--release] [-o executable] source.ell
```

## Project discovery

Project commands use the nearest `el.toml` in the current directory or an
ancestor. A missing manifest is an error. Help, version, and `elc` need no
project. `el fmt file.ell` and `el fmt -` also work without a manifest.

## el check

Resolves dependencies and checks every source declaration without emitting
machine code. `--locked` requires the existing `el.lock` to remain unchanged.
Packages declaring foreign functions require [native FFI consent](/std/ffi).
Successful checks report these package IDs on standard error.

## el build

Checks and builds the manifest's executable target. Library-only packages have
no executable target and use `el check` instead. `--release` enables
optimization with the same language semantics; `--locked` applies lockfile
rules. Each option may occur once in either order.

Outputs are written beneath the manifest root at
`build/<target-triple>/<debug-or-release>/<package-name>` on Darwin.
Development builds include debug information and low optimization.

## el run and el r

Builds the executable and launches it. `el r` is an exact alias. Program
arguments follow `--`:

```sh
el run --release -- input.txt --verbose
```

The program inherits the current directory, environment, and standard streams.
`el` preserves the program's exit status and Unix signal termination. A failed
build never launches an older executable.

## el test

Discovers public `test_*` functions with no parameters in the root package.
Each returns `Assert.Result`. Tests run sequentially in separate processes, so
a crashed test does not stop later tests.

```sh
el test
el test --release --locked --timeout 10 test_arithmetic
```

The optional filter is a case-sensitive substring of the fully qualified test
name. A filter selecting no tests is an error. `--timeout` takes a positive
whole number of seconds and kills tests that exceed it; by default there is no
timeout. The report contains one `ok` or `FAIL` line per test and a summary.
Exit status is 0 only when every selected test passes.

See [Assert](/std/assert) for a complete test example. Parallel execution and
setup and teardown hooks remain deferred.

## el fmt

Formats package sources in place, one file, or standard input:

```sh
el fmt
el fmt --check
el fmt src/main.ell
el fmt - < src/main.ell
```

`--check` reports layout differences without rewriting files and exits 1 when
formatting differs. Formatting normalizes indentation and spacing, preserves
comments and AST meaning, and does not wrap lines or reorder declarations.

## el lsp

Serves the Language Server Protocol over standard input and output. Features
include source diagnostics, name completion, document formatting, and declared
function-signature hover, including unsaved buffers. Go-to-definition, rename,
and inferred-expression hover are not implemented.

The [Neovim plugin](https://github.com/el-lang-org/el/tree/main/editors/nvim)
supports Neovim 0.11+ and starts one server per manifest project.

## el emit llvm-ir

`el emit llvm-ir --module Main` writes one package-relative module's LLVM IR to
standard output after resolution and checking. LLVM text and symbol names are
diagnostic output with no stable compatibility contract.

## elc

Compiles exactly one `.ell` module without manifest discovery, dependencies,
lockfiles, or project build metadata. It requires a public, nongeneric
`Main.main()` returning `unit` or `i32`. Normal completion of `unit` exits 0;
an `i32` result supplies the process status.

By default the executable uses the source stem in the current directory.
`-o` or `--output` selects a path; `--release` enables optimization.
`elc` has no manifest opt-in for package FFI.

## Conventions and exit codes

Command names and options are case-sensitive. Diagnostics use standard error.
`--version` prints the executable name and compiler version followed by a
newline. Options belong to their command; there is no global project-directory,
verbosity, color, or target flag.

| Status | Meaning |
| --- | --- |
| `0` | Successful command, or normally completed `unit` program |
| `1` | Reported source, manifest, dependency, build, launch, or test failure |
| `2` | Malformed command invocation |

`el run` forwards the program's status, including other nonzero values.
