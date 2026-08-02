# Introduction

EL is a small, statically typed, garbage-collected systems programming
language. It combines Elixir-inspired syntax with a small, static type system,
compiles ahead of time to native executables through LLVM, and is bootstrapped
in Rust.

This guide teaches the EL fundamentals: the language syntax, how to define
modules, the common data structures in the language, and more. This chapter
focuses on ensuring that EL is installed and that you can compile your first
program.

::: tip Current status
The v1 implementation and conformance milestones are complete. The only
supported native target is Darwin arm64 (`aarch64-apple-darwin`). Pages in this
site are written against the normative specifications in the
[`el` repository](https://github.com/el-lang-org/el).
:::

## At a glance

```el
defmodule Main do
  def main() -> i32 do
    IO.println("Hello, world!")
    0
  end
end
```

> Unless a snippet contains `defmodule`, assume it appears in the body of an
> appropriate module or function.

## Installation

EL v1 claims a single supported compilation target: **`aarch64-apple-darwin`
(Darwin arm64)**. The compiler host, LLVM target, system linker, runtime, and
executable target must all match; cross-compilation is not part of v1.

### Prerequisites

- **Rust 1.97.1** (pinned by `rust-toolchain.toml`), including `rustfmt` and
  Clippy.
- **LLVM 22.1.8** with Inkwell 0.9.0, in a shared-library build.
- **Boehm GC 8.2.12**, vendored and statically linked into the runtime.
- **Xcode Command Line Tools** providing Apple Clang, the system linker, `ar`,
  `make`, and `tar`.
- **Unicode 17.0.0** data, bundled with the distribution.

### Building from source

Until signed packages exist, build `el` from the source at
<https://github.com/el-lang-org/el>:

```sh
git clone https://github.com/el-lang-org/el.git
cd el
export LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm
export PATH="$LLVM_SYS_221_PREFIX/bin:$PATH"
cargo build --workspace --release
```

The binaries are produced at `target/release/el` and `target/release/elc`.
Verify the toolchain:

```sh
el --help
el --version   # prints exactly "el <version>"
elc --version  # prints exactly "elc <version>"
```

::: tip Finding LLVM
`LLVM_SYS_221_PREFIX` must point at the installation prefix containing
`bin/llvm-config`, and that `bin` directory should be first on `PATH` when
multiple LLVM installations exist. `llvm-config --version` must report `22.1.8`.
:::

### Supported distribution contents

A matching technical distribution contains the `el` and `elc` executables, the
LLVM shared libraries they need, the statically linked EL runtime and Boehm GC,
generated Unicode tables, the normative specifications, license notices, and
reproducibility metadata. EL is available under the MIT License; distribution
requirements are documented in
[`LICENSE_POLICY.md`](https://github.com/el-lang-org/el/blob/main/docs/LICENSE_POLICY.md).

See [Contributing: Building from Source](/contributing/building) for the full
validation commands a distribution builder must pass.

## Quickstart

EL projects are described by an `el.toml` manifest with source files under
`src/`. Source files use the `.ell` extension and are UTF-8.

### Create a project

```text
hello/
  el.toml
  src/
    main.ell
```

`el.toml`:

```toml
[package]
name = "hello"
namespace = "Hello"
version = "0.1.0"

[deps]

[target]
main = "Main"
```

`src/main.ell`:

```el
defmodule Main do
  def main() -> i32 do
    IO.println("Hello, world!")
    0
  end
end
```

The path `src/main.ell` requires the package-relative declaration
`defmodule Main`. With the manifest namespace, the fully qualified module name
is `Hello.Main`. `Main.main() -> i32` is the executable entry point; its result
is forwarded as the process exit code.

### Build and run

```sh
el check              # resolve dependencies and type-check the package
el build              # emit a native executable in the debug profile
el build --release    # optimized build, same language semantics
```

Executables are written beneath the manifest root at
`build/<target-triple>/debug/` and `build/<target-triple>/release/`, named
`package.name`. V1 has no `el run`; execute the built native program directly:

```sh
./build/aarch64-apple-darwin/debug/hello
```

### Compile one source file

Use `elc` when a program does not need a project manifest or dependencies:

```sh
elc hello.ell
./hello
```

The source must declare `Main.main() -> i32`. By default, `elc` writes an
executable named after the source file in the current directory. Use `-o` (or
`--output`) to select another path and `--release` to enable optimizations:

```sh
elc --release -o hello-fast hello.ell
```

`elc` compiles exactly one `.ell` module and does not discover `el.toml`, load
dependencies, create a lockfile, or write project build metadata.

### The module rules

- Each source file contains exactly **one** module, derived from its path
  relative to `src/`.
- Path components are lowercase `snake_case` and convert mechanically to
  `PascalCase`. So `src/http/client.ell` declares `defmodule Http.Client`.
- Every package is importable from source without a library target. `[target]`
  is optional and singular; omitting it makes the package library-only.
- V1 has a single executable target, no cross-compilation, and no integrated
  `el test`.

### Exit codes

- `0` — successful command.
- `1` — reported source, manifest, dependency, lockfile, codegen, or linker
  failure.
- `2` — malformed invocation (unknown command, duplicate/missing option, etc.).
