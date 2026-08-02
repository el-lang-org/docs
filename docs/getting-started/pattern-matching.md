# Pattern matching

## Immutable bindings

`=` introduces an immutable binding. A type annotation is optional when the type
can be inferred:

```el
answer = 42
next: i64 = answer + 1
message: string = "ready"
```

`=` is binding, **not** assignment. Bindings are immutable by default.

## Mutable locals

Use `mut` when a local binding must change, and `:=` to update it. `:=`
evaluates to `unit`:

```el
mut count: i64 = 0
count := count + 1
```

A mutable local can be rebound only with the same type.

## Common mistakes

```el
# Rejected: updating an immutable binding
x = 1
x := 2

# Rejected: rebinding with a different type
mut count: i64 = 1
count := "one"
```

## Errors are values

EL v1 has no exceptions. Recoverable errors are ordinary tagged values that you
match exhaustively:

```el
def print_number(input: string) do
  match Parser.parse_int(input) do
    {:ok, value} -> IO.println(value)
    {:error, reason} -> IO.report(reason)
  end
end
```

## Match expressions

`match` is an expression. Its arms must be exhaustive, and when its result is
used, every reachable arm must produce the same type (subject to expected-union
injection):

```el
def unwrap_or(result: {:ok, i64} | {:error, string}, fallback: i64) -> i64 do
  match result do
    {:ok, value} -> value
    {:error, _reason} -> fallback
  end
end
```

A wildcard covers all remaining alternatives:

```el
name = match status do
  :ready -> "ready"
  _ -> "not ready"
end
```

## Patterns

V1 patterns include:

- wildcards: `_`
- new immutable bindings: `value`
- literals: `200`, `:ready`, `"text"`
- tuples and tagged tuples: `{:ok, value}`
- empty and head/tail list patterns: `[]`, `[value | rest]`
- partial struct patterns
- byte-aligned bitstring patterns
- typed structural-union member bindings: `number: i64`

Pattern bindings are local to their arm, and one pattern cannot bind the same
name twice.

## Exhaustiveness

Every match must be exhaustive — including a match over an infinite type, which
normally ends with a wildcard or binding catch-all:

```el
label = match status_code do
  200 -> "ok"
  404 -> "not found"
  _ -> "other"
end
```

Arms are tried from top to bottom. An arm after a wildcard or general binding is
unreachable and rejected.

::: warning Not in v1
Match guards, alternative patterns (`p1 | p2`), pinning, and map patterns are
not part of v1.
:::

## With expressions

`with` chains refutable operations and returns the first failure unchanged,
avoiding nested `match` expressions for tagged-result pipelines:

```el
with {:ok, left} <- parse_left(input),
     {:ok, right} <- parse_right(input) do
  {:ok, left + right}
end
```

Each clause is `pattern <- expression`. Clauses are evaluated once from left to
right. A matching clause makes its bindings available to later clauses and the
body; the body runs only when every clause matches. The first value that does
not match its clause pattern becomes the result without evaluating the remaining
clauses or the body. An irrefutable clause is valid and has no propagated
failure case.

Every possible propagated failure value must fit the `with` result type, either
exactly or through expected-union injection; without an expected type, the body
establishes the result type:

```el
def validate(registration: Registration) -> ValidationResult do
  with :ok <- validate_username(registration.username),
       :ok <- validate_email(registration.email),
       :ok <- validate_age(registration.age) do
    {:ok, make_user(registration)}
  end
end
```

::: warning Not in v1
`with` has no `else` form. When failures need transformation, use an exhaustive
`match` on the propagated value.
:::

## The `Option` type

Positional lookup and similar operations return the reserved core prelude type
`Option(a) = {:some, a} | :none`:

```el
match Map.fetch(scores, "Ada") do
  {:some, score} -> IO.println(score)
  :none -> IO.println("missing")
end
```
