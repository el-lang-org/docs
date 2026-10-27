# Map

Maps are immutable key-value collections. Construction uses `%{...}`:

```el
scores = %{"Ada" => 42, "Grace" => 50}
```

Map construction and every key operation require the key type to implement both
`Eq` and `Hash`. Each `Map` signature below carries those constraints; the
key parameter `K` has the bounds `Eq + Hash`; `V` is the value type.

## Functions

### Map.new

```el
Map.new[K: Eq + Hash, V]() -> Map[K, V]
```

Creates an empty map. The key and value types come from the expected type:

```el
empty: Map[string, i64] = Map.new()   # {}
```

### Map.fetch

```el
Map.fetch[K: Eq + Hash, V](map: Map[K, V], key: K) -> Option[V]
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
Map.put[K: Eq + Hash, V](map: Map[K, V], key: K, value: V) -> Map[K, V]
```

Returns a new map with `key` bound to `value`. Replacing the value of an
existing equal key preserves that key's position:

```el
scores = Map.put(scores, "Ada", 43)   # "Ada" keeps its position
```

### Map.remove

```el
Map.remove[K: Eq + Hash, V](map: Map[K, V], key: K) -> Map[K, V]
```

Returns a new map without `key`. Removing a key deletes its position; inserting
it again appends it at the end:

```el
scores = Map.remove(scores, "Ada")
scores = Map.put(scores, "Ada", 44)   # "Ada" is now last
```

### Map.size

```el
Map.size[K: Eq + Hash, V](map: Map[K, V]) -> usize
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
`Show` and `Iterable` observe insertion order. `Show` renders a map as
`%{key => value}` with entries separated by `, ` in insertion order, when the
key and value types both implement `Show`. The runtime's seeded hash strategy
never changes this order.
