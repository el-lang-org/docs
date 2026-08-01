---
layout: home
hero:
  name: "EL"
  text: "A small, predictable systems language"
  tagline: Statically typed · garbage-collected · native AOT compilation through LLVM
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
features:
  - title: Elixir-inspired syntax
    details: Readable, low-ceremony surface syntax with `defmodule`, `def`, `|>`, and pattern matching.
  - title: Statically typed
    details: A small static type system with explicit conversions, structural unions, and no implicit coercion.
  - title: Immutable by default
    details: Value bindings are immutable by default; mutation is explicit with `mut` and `:=`.
  - title: Recoverable errors as values
    details: No exceptions in v1. Tagged tuples like `{:ok, value} | {:error, reason}` are matched exhaustively.
  - title: Native, AOT, GC-managed
    details: Compiles to a standalone native executable via LLVM, with a precise mark-sweep collector managing memory.
  - title: Deterministic resources
    details: GC manages memory, while lexical `defer` gives deterministic cleanup of files, streams, and other OS resources.
---
