# Conditionals and loops

## Conditionals

`if` is an expression, and conditions must have type `bool`. When the result is
used, both branches are required and must have the same type — unless an
expected structural union type accepts both branches:

```el
label = if score >= 50 do
  "pass"
else
  "fail"
end
```

```el
value: i64 | string = if use_number do
  1
else
  "one"
end
```

An effect-only conditional may omit `else`; its type is then `unit`:

```el
if verbose do
  IO.println("starting")
end
```

There is no truthiness: integers, strings, lists, and other values cannot be
used as conditions.

## While loops

`while` evaluates to `unit`. Rebind a mutable local with `:=`:

```el
mut i: i64 = 0
while i < 10 do
  IO.println(i)
  i := i + 1
end
```

## For loops

`for ... in` lowers through the `Iterable` protocol. The loop binding may be a
pattern:

```el
for item in items do
  IO.println(item)
end

for {name, score} in results do
  IO.println(name ++ ": " ++ Show.show(score))
end
```

The pattern must be **irrefutable** for the iterable's item type — it may not
select only one member of a union. Use an exhaustive `match` inside the loop when
item processing is refutable.

::: warning Not in v1
C-style loops, `break`, `continue`, comprehensions, and a separate infinite
`loop` form are not part of v1. Loops evaluate to `unit`.
:::

## Early return

The normal result of a function is its final expression. Use `return expression`
only to exit early:

```el
def require_positive(value: i64) -> {:ok, i64} | {:error, :not_positive} do
  if value <= 0 do
    return {:error, :not_positive}
  end

  {:ok, value}
end
```

Bare `return` is invalid. A unit-returning function uses `return unit`.
