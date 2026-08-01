# Modules and Functions

## Declarations

Function parameter and return types are explicit. A block returns its final
expression:

```el
def add(left: i64, right: i64) -> i64 do
  left + right
end
```

`def` declares a public function. `defp` declares a function visible only inside
its module. Omitting the return annotation means `-> unit`:

```el
def greet(name: string) do
  IO.println("Hello, " ++ name)
end
```

## Function values

Named functions can be passed as values:

```el
def square(value: i64) -> i64 do
  value * value
end

def apply(value: i64, f: (i64) -> i64) -> i64 do
  f(value)
end

result = apply(5, square)
```

A local binding shadows a bare function name, while a qualified public name such
as `Math.square` remains available.

::: warning Not in v1
Anonymous functions, closures, partial application, and bound receiver methods
are not part of v1. Protocol operations such as `Show.show` cannot themselves be
function values — define an ordinary named wrapper when needed.
:::

## Newlines and pipelines

EL has no semicolons. A newline separates complete constructs; a line continues
when the expression is visibly incomplete:

```el
total = subtotal +
  tax

result = input |>
  normalize() |>
  validate()
```

The pipeline operator `|>` inserts its left side as the first argument of the
call on its right:

```el
value |> transform(a, b)     # same as transform(value, a, b)
```

Pipelines associate left to right. In v1 the right side must be a statically
resolvable call; placeholders and arbitrary pipeline targets are not supported.

## One module per file

Each source file contains exactly one module, declared with `defmodule`. Its
name is derived from its path relative to `src/`:

```text
Source path          Required declaration       With namespace "Example"
src/main.ell          defmodule Main              Example.Main
src/http/client.ell   defmodule Http.Client       Example.Http.Client
src/json_api.ell      defmodule JsonApi            Example.JsonApi
src/foo/index.ell     defmodule Foo.Index          Example.Foo.Index
```

Path components must be lowercase `snake_case`; each is mechanically converted
to `PascalCase`. Acronyms and `index.ell` receive no special treatment. A module
cannot span multiple files, and nested module declarations are not supported in
v1.

## Name resolution

V1 has **no imports or module aliases**. Functions and declarations in the
current module use bare names; other modules use qualified names:

```el
validate(value)                 # current module
Http.Client.get(url)            # current package, package-relative module
Json.Decoder.decode(input)      # dependency whose namespace is Json
IO.println(message)             # core prelude module
```

Bare names resolve through lexical scope, the current module, and then the
fixed core prelude. Ambiguous module names are compile-time errors. Every
package in a resolved dependency graph must have a distinct root namespace.

## The core prelude

The prelude imports core types, protocols, and modules but **no bare
functions**. Its names — including `Option`, `Show`, `Enum`, `IO`, `List`,
`Map`, and `String` — are reserved against package declarations and dependency
root namespaces.

## Visibility

Structs, aliases, protocols, struct fields, and implementations are public in
v1. Functions use `def` for public visibility and `defp` for module-private
visibility. A module may not declare the same function name at multiple
arities.
