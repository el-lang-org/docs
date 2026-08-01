# Unions and Type Aliases

## Type aliases

`@type` creates a transparent alias, not a distinct nominal type:

```el
@type UserId = u64
@type ParseResult = {:ok, i64} | {:error, string}
@type Result(a, e) = {:ok, a} | {:error, e}
@type Maybe(a) = {:just, a} | :nothing
```

Transparent aliases must be **acyclic**, including cycles beneath a managed
container. Recursive data uses a nominal struct instead, so alias expansion and
union normalization always terminate.

`Option(a) = {:some, a} | :none` is supplied by the reserved core prelude and is
not redeclared by user modules.

## Structural unions

`A | B` is a closed structural union. Alternatives are **disjoint** when no
finite substitution of their type variables can make their normalized types
equal. Concrete invariant applications with different arguments are therefore
valid:

```el
@type NumberList = List(i64) | List(f64)
@type TaggedValue = {:ok, i64} | {:ok, string}
```

Physical representation does not determine disjointness; injection records a
hidden member discriminant. A value is injected into a union only when an
expected union type is available:

```el
def choose(flag: bool) -> i64 | string do
  if flag do
    1
  else
    "one"
  end
end

value: i64 | string = choose(condition)
```

## Matching unions

Use a **typed binding pattern** to select a member of a general union:

```el
def describe(value: i64 | string) -> string do
  match value do
    number: i64 -> Show.show(number)
    text: string -> text
  end
end
```

Tagged alternatives use structural patterns such as `{:ok, value}`.

::: note
General unions do not automatically implement protocols and cannot be a
`defimpl` target in v1; match the union before calling member-specific behavior.
:::

## Overlap errors

Overlapping alternatives are rejected at compile time with a witness. These
aliases are all invalid because their generic alternatives can overlap after
substitution:

```el
@type Either(a, b) = a | b
@type Optional(a) = a | :none
@type SpecialBox(a) = Box(a) | Box(i64)
```

For `SpecialBox`, the diagnostic identifies `a = i64` as the witness that makes
both members equal. Recursive aliases are also rejected:

```el
@type Loop = Loop
@type RecursiveList = [RecursiveList]
```

Express managed recursion through a nominal struct field instead.
