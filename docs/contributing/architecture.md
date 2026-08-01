# Compiler Architecture

The compiler is a Rust workspace of small, stage-focused crates. The normative
architecture lives in
[`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/DESIGN.md)
(section 11) and [`IR.md`](https://github.com/el-lang-org/el/blob/main/IR.md);
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
| `el-runtime` | private allocation ABI, Boehm GC, Unicode tables |
| `el-driver` | packages, manifests, lockfiles, build orchestration, native tests |
| `el-cli` | the `el` command-line surface |
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

Development proceeds through milestones M0–M9, each ending with working tests
and a runnable example. See
[`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/DESIGN.md)
section 15 for the current roadmap state.
