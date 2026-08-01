# Map

Maps are immutable key-value collections. Construction uses `%{...}`:

```el
scores = %{"Ada" => 42, "Grace" => 50}
```

Map construction and every key operation require the key type to implement both
`Eq` and `Hash`. Each `Map` signature below carries those constraints; the
repeated `when k: Eq, k: Hash` clauses are omitted for readability.

## Functions

### Map.new

```el
Map.new() -> Map(k, v)
```

Creates an empty map. The key and value types come from the expected type:

```el
empty: Map(string, i64) = Map.new()   # {}
```

### Map.fetch

```el
Map.fetch(map: Map(k, v), key: k) -> Option(v)
```

Looks up `key`. Returns `{:some, value}` when the key is present and `:none`
otherwise. Maps do not support index syntax; `fetch` keeps absence explicit:

```el
match Map.fetch(scores, "Ada") do
  {:some, score} -> IO.println(score)
  :none -> IO.println("missing")
end
```

### Map.put

```el
Map.put(map: Map(k, v), key: k, value: v) -> Map(k, v)
```

Returns a new map with `key` bound to `value`. Replacing the value of an
existing equal key preserves that key's position:

```el
scores = Map.put(scores, "Ada", 43)   # "Ada" keeps its position
```

### Map.remove

```el
Map.remove(map: Map(k, v), key: k) -> Map(k, v)
```

Returns a new map without `key`. Removing a key deletes its position; inserting
it again appends it at the end:

```el
scores = Map.remove(scores, "Ada")
scores = Map.put(scores, "Ada", 44)   # "Ada" is now last
```

### Map.size

```el
Map.size(map: Map(k, v)) -> usize
```

Returns the number of entries:

```el
count = Map.size(scores)   # 2
```

## Order and equality

Maps iterate in deterministic insertion order. Replacing the value for an
existing equal key preserves that key's position; removing a key deletes its
position, and inserting it again appends it at the end. Map literals evaluate
entries from left to right — a later duplicate replaces the earlier value
without moving the key:

```el
scores = %{"Ada" => 1, "Grace" => 2, "Ada" => 3}
# {"Ada" => 3, "Grace" => 2}
```

Map equality compares key/value membership and ignores insertion order, while
`Show` and `Iterable` observe insertion order. The runtime's seeded hash
strategy never changes this order.
