# Building from Source

The authoritative build and validation instructions live in `BUILDING.md`. This
page summarizes the commands for contributors.

## Rust workspace

Rust 1.97.1 is pinned by `rust-toolchain.toml`, including `rustfmt` and Clippy.
With the toolchain installed:

```sh
cargo build --workspace
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Milestone 0 has no third-party Rust dependencies. After Cargo has fetched any
future locked dependencies, the workspace must also build offline:

```sh
cargo build --workspace --locked --offline
```

## LLVM prerequisite

EL is pinned to LLVM 22.1.8 and Inkwell 0.9.0. Set `LLVM_SYS_221_PREFIX` to the
prefix containing `bin/llvm-config` and put that `bin` directory first on
`PATH` when multiple LLVM installations exist. On the active Darwin arm64
workstation this is `/opt/homebrew/opt/llvm`. Verify:

```sh
"${LLVM_SYS_221_PREFIX}/bin/llvm-config" --version   # must print 22.1.8
"${LLVM_SYS_221_PREFIX}/bin/llvm-config" --shared-mode
```

Enable the backend with `el-codegen`'s `llvm` feature; managed executable
builds also select `managed-runtime`:

```sh
cargo test -p el-codegen --features llvm,managed-runtime
```

A host without LLVM can type-check the private Inkwell API boundary without
linking or executing it:

```sh
cargo check -p el-codegen --features llvm-api-check --tests
```

## Boehm GC and runtime

The pinned Boehm GC 8.2.12 archive is vendored under
`runtime/vendor/boehm-gc/`. Milestone 5 encapsulates the native build behind
`el-runtime`:

```sh
cargo test -p el-runtime --features boehm
cargo test -p el-runtime --features gc-stress-test
cargo test --release -p el-runtime --features gc-stress-test
LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  cargo test -p el-driver --features gc-stress-test --test native
LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  cargo test -p el-driver --features allocation-failure-test --test native
```

`gc-stress-test` and `allocation-failure-test` are conformance build modes, not
EL source options, and must not be combined.

## V1 release gate

```sh
export LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm
export PATH="$LLVM_SYS_221_PREFIX/bin:$PATH"

cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
cargo test --release --workspace
cargo test -p el-codegen --features llvm,managed-runtime
cargo test -p el-runtime --features gc-stress-test
cargo test --release -p el-runtime --features gc-stress-test
cargo test -p el-driver --features gc-stress-test --test native
cargo test --release -p el-driver --features gc-stress-test --test native
cargo build --workspace --locked --offline
```

Publication remains blocked until the project-license issue in
`LICENSE_POLICY.md` is resolved.

## Unicode data regeneration

Unicode 17.0.0 source data and the grapheme conformance corpus are checked in
under `runtime/unicode/17.0.0`. Regenerate the deterministic private tables and
fixtures after verifying pinned inputs:

```sh
python3 tools/generate_unicode_grapheme_tables.py
```

Normal builds consume the checked-in generated files and do not require Python,
network access, a host Unicode library, or locale data.
