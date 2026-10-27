# Introduction

EL is a small, statically typed, garbage-collected systems programming
language. It uses Elixir-inspired syntax and compiles ahead of time to native
executables through LLVM. The bootstrap compiler is written in Rust.

The v1 implementation and conformance milestones are complete. The current
compiler also supports closures, collection libraries, networking, and package
FFI. The supported native target is Darwin arm64 (`aarch64-apple-darwin`).
The [language specifications](https://github.com/el-lang-org/el/tree/main/docs)
define the behavior described on this site.

## Install the compiler

Native builds require Rust 1.97.1, LLVM 22.1.8 with shared libraries, and Xcode
Command Line Tools. Boehm GC 8.2.12 and Unicode 17.0.0 data are vendored in the
compiler repository.

```sh
git clone https://github.com/el-lang-org/el.git
cd el
make build-install INSTALL_DIR="$HOME/.local/bin"
export PATH="$HOME/.local/bin:$PATH"
el --version
elc --version
```

The Makefile defaults `LLVM_SYS_221_PREFIX` to `/opt/homebrew/opt/llvm`.
To use another installation, pass `LLVM_SYS_221_PREFIX="/path/to/llvm"`.
`bin/llvm-config --version` under that prefix must report `22.1.8`.

`make build` compiles the release binaries with the native backend and managed
runtime. `make install INSTALL_DIR="/path/to/bin"` installs existing binaries.
See [Building from source](/contributing/building) for Cargo commands and
validation requirements.

## Compile a first program

Save this as `hello.ell`:

```el
module Main

fn main() do
	IO.println("Hello, world!")
end
```

Compile and run it:

```sh
elc hello.ell
./hello
```

The program prints `Hello, world!` and exits with status 0. An omitted return
type means `unit`. A public, nongeneric `Main.main()` may instead return `i32`
to choose the process exit code.

`elc` compiles one source file without discovering a manifest or dependencies.
Use `elc --release -o hello-fast hello.ell` for an optimized executable at a
chosen path.

Unless an example contains a `module` header, place its declarations in a
module and its executable statements inside a function.

## Create a project

Projects use an `el.toml` manifest and UTF-8 `.ell` source files under `src/`:

```text
hello/
  el.toml
  src/
    main.ell
```

Create `el.toml`:

```toml
[package]
name = "hello"
namespace = "Hello"
version = "0.1.0"

[deps]

[target]
main = "Main"
```

Copy the first program into `src/main.ell`, then check and run it:

```sh
el check
el run
el run --release
```

Both runs print `Hello, world!`. `el r` is an alias for `el run`. Pass program
arguments after `--`, for example `el run -- one two`.

`el build` builds without launching. Executables are named after `package.name`
and written beneath the manifest root at
`build/<target-triple>/<debug-or-release>/`.

## Module rules

Each file has one `module Name` header with no enclosing `do` or final `end`.
The path relative to `src/` determines its package-relative name. For example,
`src/http/client.ell` declares `module Http.Client`.

Path components use lowercase `snake_case` and convert to `PascalCase`.
With namespace `Hello`, `src/main.ell` defines `Hello.Main`. Modules cannot span
files or nest declarations. Omitting `[target]` makes a package library-only;
its modules remain importable by dependencies.

EL compiles for the compiler host. Cross-compilation and Linux native support
remain deferred.

## Tools and examples

The [CLI reference](/getting-started/cli) covers `el test`, `el fmt`, and `el lsp`.
The [modules and functions guide](/getting-started/modules-and-functions) covers
closures, explicit generics, and pipelines.

Runnable projects in the compiler repository include
[math and custom operators](https://github.com/el-lang-org/el/tree/main/examples/math_operators),
[local TCP and HTTP clients and servers](https://github.com/el-lang-org/el/tree/main/examples/net_http),
and [native FFI](https://github.com/el-lang-org/el/tree/main/examples/native_ffi).
