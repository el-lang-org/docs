# Task

A task runs one computation in its own actor and retains its result for the
actor that started it. `Task.Task[T]` is owned by its creator and does not
implement `Send`.

## Functions

### Task.async

```el
Task.async[T: Send](work: () -> T) -> Task.Task[T]
```

Starts `work` in a new actor and returns the task at once. `T` must be `Send`,
and a closure literal passed here may capture only `Send` values. The calling
actor watches the task, so a runtime failure inside `work` is reported by
`await` as `{:error, {:panic, message}}`.

```el
task = Task.async(fn -> 6 * 7 end)
match Task.await(task) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("task ended without a result")
end
```

### Task.await

```el
Task.await[T](task: Task.Task[T]) -> {:ok, T} | {:error, Actor.Exit}
```

Waits without a limit for `task` and returns `{:ok, value}`, or `{:error,
reason}` when the task ended without a result, where `reason` is its
`Actor.Exit`. Awaiting the same task again returns the same result. Call it
only from the actor that started the task.

```el
task = Task.async(fn -> 6 * 7 end)
match Task.await(task) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("task ended without a result")
end
```

### Task.await_within

```el
Task.await_within[T](task: Task.Task[T], millis: i64) -> {:ok, T} | {:error, Actor.Exit} | :timeout
```

Waits up to `millis` milliseconds for `task`, returning its result or
`Actor.Exit`. Zero or less checks once without waiting. A `:timeout` leaves the
task running and awaitable, so a later await can still collect its result.
Only the actor that created the task may await it.

```el
task = Task.async(fn -> 6 * 7 end)
match Task.await_within(task, 1000) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("task ended without a result")
	:timeout -> IO.report("task still running")
end
```

### Task.map

```el
Task.map[A: Send, B: Send](items: [A], limit: usize, work: (A) -> B) -> [{:ok, B} | {:error, Actor.Exit}]
```

Runs `work(item)` for each element of `items` in its own task and returns the
results in input order, each `{:ok, value}` or `{:error, reason}` for a task
that failed. At most `limit` tasks run at a time; a `limit` of zero counts as
one. It starts the next task when the oldest running one has finished.

```el
results = Task.map([1, 2, 3], 2, fn value: i64 -> value * value end)
# [{:ok, 1}, {:ok, 4}, {:ok, 9}]
```

`async` returns immediately. The result must be sendable, and a closure literal
passed directly as `work` can capture only sendable values. `await` waits
without a limit. A failing task returns `{:error, reason}` with its
`Actor.Exit`, so the awaiting actor survives the task's failure.

`await_within` waits up to `millis` milliseconds. Zero or less checks once.
A timeout leaves the task running and awaitable. Repeated awaits return the
same completed result. Awaiting another actor's task fails with `not_owner`.

```el
task = Task.async(fn -> 6 * 7 end)
match Task.await(task) do
	{:ok, answer} -> IO.println(answer)
	{:error, _} -> IO.report("task ended without a result")
end
# Prints 42.
```

`map` starts and awaits tasks in input order, with at most `limit` running at
once. A limit of zero counts as one. Results keep input order. The next task
starts only after the oldest running task has been awaited, so a slow task can
delay later starts.

Task and Actor failures retain two-element error tuples. The operation-error
shape `{:error, reason, message}` used by File and Net does not apply here.
When `main` returns, unfinished tasks stop with the process.
