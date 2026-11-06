# Compiler architecture

The compiler is a Rust workspace of small, stage-focused crates. The normative
architecture lives in
[`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/docs/DESIGN.md)
(section 11) and [`IR.md`](https://github.com/el-lang-org/el/blob/main/docs/IR.md);
this page summarizes
the stage pipeline and crate layout.

## Pipeline

```text
.ell source
    |
    v
PEG parse tree -> AST -> name resolution + type checking -> Typed AST
    -> generic Core IR -> monomorphization -> concrete Core IR
    -> LLVM IR -> LLVM optimization -> object file
    -> system linker -> native executable
```

## Crate layout

| Crate | Responsibility |
| --- | --- |
| `el-parser` | PEG parsing and lexing into AST with spans and recovery |
| `el-ast` | AST types and debug output |
| `el-resolve` | namespaces, visibility, aliases, layout cycles, protocol coherence |
| `el-types` | type checking, inference, unions, exhaustiveness |
| `el-ir` | typed AST and Generic/Concrete Core IR contracts, lowering, verification |
| `el-codegen` | monomorphization and LLVM lowering (Inkwell, `llvm` feature) |
| `el-runtime` | private allocation ABI, Boehm GC, actor scheduling, socket poller, isolated FFI helper, Unicode, and TLS |
| `el-driver` | packages, manifests, lockfiles, build orchestration, native tests |
| `el-cli` | `el` package commands and the `elc` single-file compiler |
| `el-fmt` | AST-preserving source formatting |
| `el-lsp` | editor diagnostics, completion, formatting, and signature hover |
| `el-span` | source spans |

## Invariants

- LLVM IR is never used as the type checker or primary semantic model.
- All stages preserve byte spans and left-to-right, exactly-once evaluation
  order.
- Stable typed IDs identify compiler-local entities; source spellings,
  addresses, and hash-map iteration order are never semantic identities.
- Compiler-generated IR is verified at stage boundaries; invalid EL input
  receives structured diagnostics and never panics or passes into later phases.
- Backend, platform, GC, and `unsafe` details stay behind small private
  interfaces.

## Roadmap milestones

Milestones M0 through M9 complete v1. M10 adds anonymous functions with
immutable snapshot captures. Later accepted decisions add syntax and libraries,
including package FFI, Math protocols, fixed Unicode infix operators,
character-code literals, actors, tasks, and supervision.
See
[`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/docs/DESIGN.md)
section 15 for the current roadmap state.

## Standard-library boundaries

Modules in `stdlib/` are embedded EL source checked with each compilation.
Collections, formatting, HTTP policy, file I/O, plain-socket policy, and string
transformations are implemented in EL. Private runtime interfaces contain
allocation, platform, foreign-memory, Unicode, and TLS details.

Foreign calls have explicit declarations and verified boundary types. Generic
Math and operator dispatch resolves during monomorphization; concrete Core
rejects residual protocol dispatch. Existing closure conversion handles composed
function captures. LLVM remains the backend, separate from semantic checking.

## Library operations and Core IR

Library behavior stays in embedded EL source over small runtime interfaces.
`Enum.reduce_while` implements early termination in EL. Integer and float text
scanners also live in EL. Decimal-to-binary64 conversion uses a private runtime
service for locale-independent rounding. These additions introduce no new Core
IR operation.

`for` lowers through `Iterable.iter` and `Iterable.next` cursors for standard
and user-defined sources. List cursors advance by tail, and string-view cursors
advance by byte offset. `Enum` traversal functions use those loops.

Native library services use `StandardCall` rows in `RUNTIME_TABLE`. Each row
records the signature, runtime symbol, ABI argument order, and collection
behavior. The checker and Typed AST use that table too. A new library function
does not require a new Core IR operation. Run `sh scripts/check-core-ir-budget.sh`
to check the operation and standard-function budgets.

Actor prelude modules use private generic foreign declarations to pass erased
messages and closures to the runtime. Core IR inserts `Safepoint` at function
entries and loop cycles. Code generation emits a poll for kill, stack-limit,
and scheduling checks. Literal reason patterns and union widening use existing
union operations, with no error-specific Core IR operation.

The type checker, IR implementation, and LLVM backend are split into modules
by subject. Backend, scheduler, platform, and collector details remain private
to their implementing crates.

## Diagnostics and editor recovery

The parser collects independent syntax errors within and across source files
before name resolution. Recovery nodes never enter resolution or later stages.
A failed expression has no EL type. Checker recovery still visits independent
siblings without inventing `unit` results or repeating errors for a failed binding.
Invalid programs never reach lowering.

The CLI and language server share source diagnostics, including `E2038` for a
module header that disagrees with its source path. LSP diagnostics retain notes,
help, and secondary locations from the same unsaved source map. Publication
order is deterministic, and only identical diagnostics are deduplicated.

When no loadable project contains a buffer, the language server checks the
buffer as a standalone module. Project-only completion and hover remain empty.
See [Neovim setup](/getting-started/neovim) for the editor behavior.

## Actor runtime

Darwin arm64 uses green threads with a work-stealing scheduler. Socket,
connection, and TLS waits park actors on a kqueue poller. Other blocking native
calls run on a worker stack; the scheduler can transfer work to a spare thread.
Other targets and sanitizer builds use one OS thread per actor.

Actor-owned resources enforce runtime ownership. Failure and kill paths close
owned resources and notify monitors without unwinding skipped EL frames.
Standard-stream operations use critical sections to defer kills while shared
state changes. Isolated foreign libraries run in a companion helper process,
so their crashes can become actor exit reasons. See [Actor](/std/actor),
[Native FFI](/std/ffi), and [runtime validation](/contributing/building#actor-runtime-validation).
