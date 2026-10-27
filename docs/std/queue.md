# Queue

`Queue.Queue[A]` is a persistent first-in, first-out queue. Operations return
new values and need no protocol bounds on `A`. Push and pop are amortized O(1).

## Functions

```el
Queue.new[A]() -> Queue.Queue[A]
Queue.push[A](queue: Queue.Queue[A], item: A) -> Queue.Queue[A]
Queue.size[A](queue: Queue.Queue[A]) -> usize
Queue.empty[A](queue: Queue.Queue[A]) -> bool
Queue.peek[A](queue: Queue.Queue[A]) -> {:some, A} | :none
Queue.pop[A](queue: Queue.Queue[A]) -> {:some, {A, Queue.Queue[A]}} | :none
Queue.to_list[A](queue: Queue.Queue[A]) -> [A]
Queue.from_list[A](items: [A]) -> Queue.Queue[A]
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
