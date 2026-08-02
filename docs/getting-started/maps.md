# Maps

Maps are immutable key-value collections. Construction uses `%{...}`:

```el
scores = %{"Ada" => 42, "Grace" => 50}
```

Map construction and every key operation require the key type to implement both
`Eq` and `Hash`. Lookup returns the standard `Option` tagged union rather than a
nullable value:

```el
match Map.fetch(scores, "Ada") do
  {:some, score} -> IO.println(score)
  :none -> IO.println("missing")
end
```

Maps iterate in deterministic insertion order. Replacing the value for an
existing equal key preserves that key's position; removing a key deletes its
position, and inserting it again appends it at the end:

```el
scores = Map.put(scores, "Ada", 43)   # "Ada" keeps its position
scores = Map.remove(scores, "Ada")
scores = Map.put(scores, "Ada", 44)   # "Ada" is now last
```

Map equality compares key/value membership and ignores insertion order, while
`Show` and `Iterable` observe insertion order. `Show` renders a map as
`%{key => value}` with entries separated by `, ` in insertion order. The
runtime's seeded hash strategy never changes this order.

For the complete list of `Map` functions with signatures and examples, see the
[`Map` reference](/std/map).
