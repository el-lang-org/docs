# Heap

`Heap.Heap[A]` is a persistent min-heap. The smallest item leaves first.
`push`, `pop`, `from_list`, and `to_list` require `A: Ord`; other functions
need no bound. Push is O(1), and pop is amortized O(log n).

## Functions

### Heap.new

```el
Heap.new[A]() -> Heap.Heap[A]
```

Returns an empty min-heap. `Heap.new()`; the element type comes from context.

```el
heap: Heap.Heap[i64] = Heap.new()
```

### Heap.size

```el
Heap.size[A](heap: Heap.Heap[A]) -> usize
```

Returns the number of items in `heap`.

```el
heap = Heap.from_list([3, 1, 2])
value = Heap.size(heap) # 3
```

### Heap.empty

```el
Heap.empty[A](heap: Heap.Heap[A]) -> bool
```

Returns true when `heap` holds no items.

```el
heap = Heap.from_list([3, 1, 2])
value = Heap.empty(heap) # false
```

### Heap.push

```el
Heap.push[A: Ord](heap: Heap.Heap[A], item: A) -> Heap.Heap[A]
```

Returns a new heap with `item` added. `heap` is unchanged (the heap is
persistent). O(1). Items must be orderable (`Ord`); duplicates are kept.

```el
heap = Heap.from_list([10, 20])
next = Heap.push(heap, 5)
items = Heap.to_list(next) # [5, 10, 20]
```

### Heap.peek

```el
Heap.peek[A](heap: Heap.Heap[A]) -> {:some, A} | :none
```

Returns `{:some, smallest}` without removing it, or `:none` when `heap` is
empty.

```el
value = Heap.peek(Heap.from_list([10, 20])) # {:some, 10}
```

### Heap.pop

```el
Heap.pop[A: Ord](heap: Heap.Heap[A]) -> {:some, {A, Heap.Heap[A]}} | :none
```

Returns `{:some, {smallest, rest}}`, where `rest` is the heap without that
item, or `:none` when `heap` is empty. `heap` is unchanged. Amortized O(log
n). Equal items leave in an unspecified order.

```el
match Heap.pop(Heap.from_list([10, 20])) do
	{:some, {value, rest}} -> IO.println(value) # 10
	:none -> IO.println("empty")
end
```

### Heap.from_list

```el
Heap.from_list[A: Ord](items: [A]) -> Heap.Heap[A]
```

Builds a heap holding every element of `items`. Duplicates are kept; order of
`items` does not matter.

```el
heap = Heap.from_list([3, 1, 2])
```

### Heap.to_list

```el
Heap.to_list[A: Ord](heap: Heap.Heap[A]) -> [A]
```

Returns every item of `heap` in ascending order. `heap` is unchanged. O(n log
n).

```el
items = Heap.to_list(Heap.from_list([3, 1, 2])) # [1, 2, 3]
```

`peek` returns the smallest item. `pop` returns it and the remaining heap.
Both return `:none` for an empty heap. `to_list` returns ascending order.
The order of items that compare equal is unspecified.

```el
heap = Heap.from_list([3, 1, 2])
IO.println(Heap.to_list(heap)) # [1, 2, 3]
```
