# Enumerables

Generic collection traversal lives in `Enum`. A single `Enum` function works
over any iterable — lists, arrays, slices, `bytes`, string views, and maps —
without the call site writing protocol constraints:

```el
squares: [i64] = Enum.map([1, 2, 3], square)

def add(total: i64, value: i64) -> i64 do
  total + value
end

total = Enum.reduce([1, 2, 3], 0, add)
second: Option(i64) = Enum.at([10, 20, 30], 1)   # {:some, 20}
missing: Option(i64) = Enum.at([10, 20, 30], 3)   # :none
```

Function arguments are monomorphic named function values, because v1 has no
anonymous functions or closures:

```el
def is_positive(value: i64) -> bool do
  value > 0
end

positive: [i64] = Enum.filter([-2, 0, 3], is_positive)   # [3]
has_positive = Enum.any([-2, -1, 3], is_positive)   # true
all_positive = Enum.all([1, 2, 3], is_positive)   # true
```

`Enum.frequencies` counts occurrences of each item into a `Map(item, usize)` in
traversal order; the item type must satisfy `Eq` and `Hash`:

```el
counts: Map(string, usize) = Enum.frequencies(["a", "b", "a"])
# %{"a" => 2, "b" => 1}
```

Traversal follows each iterable's deterministic order. On maps the item type is
always `{key, value}` and order is insertion order; `bytes` iterate by
increasing byte offset; string views iterate in source order.

For the complete list of `Enum` functions with signatures and examples, see the
[`Enum` reference](/std/enum).
