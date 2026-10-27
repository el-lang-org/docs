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
| `el-runtime` | private allocation ABI, Boehm GC, Unicode tables, TLS, and native helpers |
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
including scalar package FFI, Math protocols, and fixed Unicode infix operators.
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
