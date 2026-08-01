# Contributing

EL is a small, spec-first language with a Rust bootstrap implementation. The
contribution guidance below mirrors the repository's own rules.

## Principles

- Keep EL aligned with the checked-in specifications. Do not invent compiler
  behavior when a contract is missing or ambiguous.
- Before a change, identify the affected compiler stage and current roadmap
  milestone, then read the relevant authoritative document.
- For an intentional language change, update the authoritative document and
  record an accepted decision in
  [`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/docs/DESIGN.md) before
  implementation or examples
  depend on it.
- Prefer a narrow end-to-end milestone slice over disconnected scaffolding.
- Preserve unrelated uncommitted work and avoid drive-by rewrites.

## Document routing

| Subject | Source to read |
| --- | --- |
| Lexical rules and concrete syntax | [`GRAMMAR.md`](https://github.com/el-lang-org/el/blob/main/docs/GRAMMAR.md) |
| Type formation, static semantics, well-formedness | [`TYPES.md`](https://github.com/el-lang-org/el/blob/main/docs/TYPES.md) |
| Compiler representations, lowering boundaries, verifier invariants | [`IR.md`](https://github.com/el-lang-org/el/blob/main/docs/IR.md) |
| Vision, runtime semantics, architecture, roadmap, decisions | [`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/docs/DESIGN.md) |
| Toolchain, dependency, build, native prerequisites | [`BUILDING.md`](https://github.com/el-lang-org/el/blob/main/docs/BUILDING.md) |
| Illustrative programs and examples | [`EXAMPLES.md`](https://github.com/el-lang-org/el/blob/main/docs/EXAMPLES.md) |

## Implementation rules

- Follow [`DESIGN.md`](https://github.com/el-lang-org/el/blob/main/docs/DESIGN.md)
  milestones in order and complete each stated exit test.
- Keep compiler stages distinct; never use LLVM IR as the type checker.
- Preserve byte spans and EL's left-to-right, exactly-once evaluation order.
- Use stable typed IDs for compiler-local entities — never source spellings,
  addresses, pointers, or hash-map iteration order as identities.
- Verify invariants at compiler boundaries; invalid EL input receives a
  structured diagnostic and must not panic or pass into later phases.
- Isolate backend, platform, GC, and `unsafe` details behind small private
  interfaces.
- Represent expected failures with structured errors; reserve panics for
  documented internal invariants.
- Make generated output deterministic.

## Tests and handoff

- Add a regression test for every compiler or runtime bug at the narrowest
  useful layer, covering accepted and rejected forms including spans.
- Prefer semantic assertions and deterministic AST/Typed AST/Core IR snapshots.
- For backend-sensitive semantics, test development and optimized builds.
- Before handoff, follow
  [`BUILDING.md`](https://github.com/el-lang-org/el/blob/main/docs/BUILDING.md) and run
  the workspace checks plus the
  applicable milestone exit test.

See [Building from Source](/contributing/building) for the exact commands and
[Compiler Architecture](/contributing/architecture) for the stage overview.
