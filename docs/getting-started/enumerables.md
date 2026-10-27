# Enumerables

`Enum` traverses lists, arrays, slices, bytes, string views, and maps through
`Iterable`. Callbacks may be named functions, closures, or capture shorthand:

```el
squares: [i64] = Enum.map([1, 2, 3], &(&1 * &1)) # [1, 4, 9]
total = Enum.reduce([1, 2, 3], 0, &(&1 + &2))    # 6
second: Option[i64] = Enum.at([10, 20, 30], 1)  # {:some, 20}
missing: Option[i64] = Enum.at([10, 20, 30], 3)  # :none

minimum: i64 = 0
positive = Enum.filter([-2, 0, 3], fn value -> value > minimum end) # [3]
has_positive = Enum.any([-2, -1, 3], &(&1 > 0)) # true
all_positive = Enum.all([1, 2, 3], &(&1 > 0))   # true
```

Closures capture immutable snapshots of referenced outer values. Parameters
infer their types from the expected callback type or body constraints.

`Enum.frequencies` counts each distinct item into a `Map[Item, usize]`.
Items need `Eq` and `Hash`; map entries follow the order of first appearance:

```el
counts: Map[string, usize] = Enum.frequencies(["a", "b", "a"])
# %{"a" => 2, "b" => 1}
```

Maps yield `{key, value}` pairs in insertion order. Lists traverse head to tail,
arrays and slices by index, bytes by byte offset, and string views in source
order. `map`, `filter`, and `to_list` return lists.

See the [Enum reference](/std/enum) for signatures and the
[Set](/std/set), [Queue](/std/queue), and [Heap](/std/heap) references for
additional persistent collections.
