# Queue

`Queue.Queue[A]` is a persistent first-in, first-out queue. Operations return
new values and need no protocol bounds on `A`. Push and pop are amortized O(1).

## Functions

### Queue.new

```el
Queue.new[A]() -> Queue.Queue[A]
```

Returns an empty queue. `Queue.new()`; the element type comes from context.

```el
queue: Queue.Queue[i64] = Queue.new()
```

### Queue.push

```el
Queue.push[A](queue: Queue.Queue[A], item: A) -> Queue.Queue[A]
```

Returns a new queue with `item` added at the back. `queue` is unchanged (the
queue is persistent).

```el
queue = Queue.from_list([10, 20])
next = Queue.push(queue, 5)
items = Queue.to_list(next) # [10, 20, 5]
```

### Queue.size

```el
Queue.size[A](queue: Queue.Queue[A]) -> usize
```

Returns the number of items in `queue`.

```el
queue = Queue.from_list([10, 20])
value = Queue.size(queue) # 2
```

### Queue.empty

```el
Queue.empty[A](queue: Queue.Queue[A]) -> bool
```

Returns true when `queue` holds no items.

```el
queue = Queue.from_list([10, 20])
value = Queue.empty(queue) # false
```

### Queue.peek

```el
Queue.peek[A](queue: Queue.Queue[A]) -> {:some, A} | :none
```

Returns `{:some, front_item}` without removing it, or `:none` when `queue` is
empty.

```el
value = Queue.peek(Queue.from_list([10, 20])) # {:some, 10}
```

### Queue.pop

```el
Queue.pop[A](queue: Queue.Queue[A]) -> {:some, {A, Queue.Queue[A]}} | :none
```

Returns `{:some, {front_item, rest}}`, where `rest` is the queue without that
item, or `:none` when `queue` is empty. `queue` is unchanged.

```el
match Queue.pop(Queue.from_list([10, 20])) do
	{:some, {value, rest}} -> IO.println(value) # 10
	:none -> IO.println("empty")
end
```

### Queue.to_list

```el
Queue.to_list[A](queue: Queue.Queue[A]) -> [A]
```

Returns the items in pop order, front first. `queue` is unchanged.

```el
items = Queue.to_list(Queue.from_list([3, 1, 2])) # [3, 1, 2]
```

### Queue.from_list

```el
Queue.from_list[A](items: [A]) -> Queue.Queue[A]
```

Builds a queue whose front is the first element of `items`, so `pop` returns
the elements in list order.

```el
queue = Queue.from_list([3, 1, 2])
```

`peek` returns the oldest item. `pop` returns that item together with the
remaining queue. Either returns `:none` for an empty queue. `to_list` lists
items oldest first; `from_list` preserves list order.

```el
queue = Queue.from_list([10, 20])
next = Queue.push(queue, 30)
IO.println(Queue.to_list(next)) # [10, 20, 30]
IO.println(Queue.size(queue))   # 2
```
