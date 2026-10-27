# Heap

`Heap.Heap[A]` is a persistent min-heap. The smallest item leaves first.
`push`, `pop`, `from_list`, and `to_list` require `A: Ord`; other functions
need no bound. Push is O(1), and pop is amortized O(log n).

## Functions

```el
Heap.new[A]() -> Heap.Heap[A]
Heap.size[A](heap: Heap.Heap[A]) -> usize
Heap.empty[A](heap: Heap.Heap[A]) -> bool
Heap.push[A: Ord](heap: Heap.Heap[A], item: A) -> Heap.Heap[A]
Heap.peek[A](heap: Heap.Heap[A]) -> {:some, A} | :none
Heap.pop[A: Ord](heap: Heap.Heap[A]) -> {:some, {A, Heap.Heap[A]}} | :none
Heap.from_list[A: Ord](items: [A]) -> Heap.Heap[A]
Heap.to_list[A: Ord](heap: Heap.Heap[A]) -> [A]
```

`peek` returns the smallest item. `pop` returns it and the remaining heap.
Both return `:none` for an empty heap. `to_list` returns ascending order.
The order of items that compare equal is unspecified.

```el
heap = Heap.from_list([3, 1, 2])
IO.println(Heap.to_list(heap)) # [1, 2, 3]
```
