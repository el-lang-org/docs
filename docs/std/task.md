# Task

A task runs one computation in its own actor and retains its result for the
actor that started it. `Task.Task[T]` is owned by its creator and does not
implement `Send`.

## Functions

```el
Task.async[T: Send](work: () -> T) -> Task.Task[T]
Task.await[T](task: Task.Task[T]) -> {:ok, T} | {:error, Actor.Exit}
Task.await_within[T](task: Task.Task[T], millis: i64) -> {:ok, T} | {:error, Actor.Exit} | :timeout
Task.map[A: Send, B: Send](items: [A], limit: usize, work: (A) -> B) -> [{:ok, B} | {:error, Actor.Exit}]
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
