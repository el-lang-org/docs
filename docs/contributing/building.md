# Building from source

The source lives in the
[`el` repository](https://github.com/el-lang-org/el). The authoritative build
and validation instructions live in
[`BUILDING.md`](https://github.com/el-lang-org/el/blob/main/docs/BUILDING.md). This
page summarizes the commands for contributors.

```sh
git clone https://github.com/el-lang-org/el.git
cd el
```

## Rust workspace

Rust 1.97.1 is pinned by `rust-toolchain.toml`, including `rustfmt` and Clippy.
With the toolchain installed:

```sh
cargo build --workspace
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

After Cargo has fetched the locked dependencies, the workspace also builds
offline:

```sh
cargo build --workspace --locked --offline
```

## Build and install native binaries

On Darwin arm64 with LLVM 22.1.8 installed:

```sh
make build-install INSTALL_DIR="$HOME/.local/bin"
```

`make build` compiles release `el` and `elc` with the native backend and managed
runtime. `make install` copies existing binaries. The default installation
folder is `$HOME/.local/bin`. `CARGO_TARGET_DIR` changes the Cargo output folder
for both targets. Override LLVM with `LLVM_SYS_221_PREFIX="/path/to/llvm"`.

The equivalent native Cargo build is:

```sh
LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  cargo build --release -p el-cli --features managed-runtime
```

A default `cargo build --workspace` supports frontend development without LLVM.
It does not enable native executable compilation.

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

`gc-stress-test`, `allocation-failure-test`, and `kill-stress-test` are separate
conformance build modes, not EL source options. Do not combine them.

## Actor runtime validation

Darwin arm64 uses green actors by default. Set `EL_WORKERS=<n>` to change the
worker count, or `EL_SCHEDULER=threads` to select one OS thread per actor.
Sanitizer builds always use OS threads.

Kill stress ends every actor except `main` at pseudo-random safepoints. Run only
the dedicated test, because other native tests expect their actors to finish:

```sh
LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  EL_KILL_STRESS_SEED=7 \
  cargo test -p el-driver --features kill-stress-test --test native -- kill_stress
```

`EL_KILL_STRESS_MEAN` sets the mean distance between kills, default 400
safepoints. Stress builds reduce scheduler fixture sizes because each managed
allocation collects.

An isolated-library manifest requires a host C compiler for the companion
helper. `CC` selects that compiler. Validate the linking and helper path with:

```sh
LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  cargo test -p el-cli --features managed-runtime --test isolated_ffi
```

Keep `<program>-ffi-helper` beside the program when deploying an isolated build.

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
cargo test -p el-driver --features managed-runtime --test native
cargo test --release -p el-driver --features managed-runtime --test native
cargo test -p el-driver --features gc-stress-test --test native
cargo test --release -p el-driver --features gc-stress-test --test native
cargo test -p el-cli --features managed-runtime --test isolated_ffi
cargo build --workspace --locked --offline
```

Distributions must include the MIT license notice and the notices required by
`LICENSE_POLICY.md`.

## Unicode data regeneration

Unicode 17.0.0 source data and the grapheme conformance corpus are checked in
under `runtime/unicode/17.0.0`. Regenerate the deterministic private tables and
fixtures after verifying pinned inputs:

```sh
python3 tools/generate_unicode_grapheme_tables.py
```

Normal builds consume the checked-in generated files and do not require Python,
network access, a host Unicode library, or locale data.

The lowercase mapping uses checked-in EL data generated from pinned Rust
Unicode 17.0.0 tables:

```sh
rustc tools/generate_lowercase.rs -o /tmp/el-generate-lowercase
/tmp/el-generate-lowercase
el fmt stdlib/string.ell
```

## Network TLS validation

Darwin links the system Network and Security frameworks. No separate TLS
library is needed by EL executables. Offline tests use OpenSSL 3 when available
and skip with a reason otherwise. They do not install trust roots.

Trusted TLS, host-name mismatch, and TLS read-timeout tests require network opt-in:

```sh
EL_NET_TLS_ONLINE=1 LLVM_SYS_221_PREFIX=/opt/homebrew/opt/llvm \
  cargo test -p el-driver --features gc-stress-test --test native tls_trusted -- --nocapture
```

Default validation uses local peers and reserved `.invalid` names.

## Sanitizers and fuzzing

`EL_RUNTIME_SANITIZE=address,undefined` instruments the private C runtime;
Boehm GC remains uninstrumented. Set `ASAN_OPTIONS=detect_leaks=0` because the
collector's allocations are not tracked. Use the same sanitizer setting for
all code linking that runtime. Unset the setting to return to a normal build.

Actor runtime tests also run under ThreadSanitizer:

```sh
EL_RUNTIME_SANITIZE=thread cargo test -p el-runtime --features boehm
```

Repeat the timing-dependent suite before trusting one passing run.
ThreadSanitizer's shadow stack is limited to 65,536 entries. Deep recursion can
exceed that limit before an OS-thread actor reaches its runtime stack limit.
Keep recursive sanitizer fixtures below that depth.

Workspace tests include seeded parser and formatter mutations. Coverage-guided
`cargo-fuzz` targets under `fuzz/` need nightly Rust. See the authoritative
[build instructions](https://github.com/el-lang-org/el/blob/main/docs/BUILDING.md#sanitizers-and-fuzzing)
for commands and corpus handling.
