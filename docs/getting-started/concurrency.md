# Actors and tasks

Actors run independently and exchange typed messages. Values sent between
actors are immutable. File handles, sockets, mailboxes, task handles, and
foreign memory belong to the actor that creates them.

## Run a task and collect its result

Save this as `tasks.ell`:

```el
module Main

# Starts a computation, prints its result, and reports a task failure.
fn main() do
	task = Task.async(fn -> 6 * 7 end)
	match Task.await(task) do
		{:ok, answer} -> IO.println(answer)
		{:error, _} -> IO.report("task ended without a result")
	end
end
```

Compile and run it:

```sh
elc tasks.ell
./tasks
```

The program prints `42` and exits with status 0. `Task.await` keeps `main`
alive until the result arrives. Returning from `main` ends every remaining
actor without cleanup.

`Task.await_within(task, millis)` adds a `:timeout` case. A timeout leaves the
task running, so you can await it again. [Task.map](/std/task) runs bounded
parallel work and returns results in input order.

## Call a stateful actor

Save this as `counter.ell`:

```el
module Main

@type Message = {:add, i64} | {:get, Actor.Reply[i64]} | :stop

# Starts a counter, adds five, prints its state, and requests shutdown.
fn main() do
	counter = Actor.start(0, fn
		{:add, amount}: Message, count: i64 -> {:continue, count + amount}
		{:get, reply}, count ->
			Actor.reply(reply, count)
			{:continue, count}
		:stop, _ -> :stop
	end)
	Actor.send(counter, {:add, 5})
	match Actor.call(counter, fn reply: Actor.Reply[i64] -> {:get, reply} end) do
		{:ok, count} -> IO.println(count)
		{:error, _} -> IO.report("counter ended before replying")
	end
	Actor.send(counter, :stop)
end
```

Compile it with `elc counter.ell`, then run `./counter`. It prints `5`.
Messages from one sender stay in order, so the `:get` request observes the
earlier `:add`. The handler's first message parameter fixes the message type.
Its result either replaces the state or stops the actor.

`Actor.call` waits on a one-shot reply slot without consuming the caller's
mailbox messages. `call_within` adds a timeout and discards late replies.
For a custom receive loop, use `Actor.spawn` and
[Mailbox.receive](/std/mailbox).

## Handle actor failures

An unrecoverable failure in a child actor ends that actor. A task exposes its
exit through `{:error, Actor.Exit}`. An actor monitor converts its exit to a
message in the watcher's mailbox. Links propagate non-normal exits to linked
actors; trapped exits become messages instead.

The runtime closes an ending actor's owned resources, but skipped `defer`
actions do not run. Failures in `main`, allocation exhaustion, and failures
inside runtime critical or blocking sections end the process. A direct `Actor.kill`
cannot be trapped.

Use [Actor monitors and links](/std/actor#monitor-and-kill) to observe failures.
Use a [Supervisor](/std/supervisor) to restart a fixed set of children under
typed names.

## Keep resources in their owning actor

The compiler derives `Send` for message and result types. Sending an owned
resource receives `E2120`; capturing one in a closure literal passed directly
to an actor or task constructor receives `E2183`. Create the resource inside
the worker instead:

```el
task = Task.async(fn -> File.read_text("input.txt") end)
match Task.await(task) do
	{:ok, result} ->
		match result do
			{:ok, text} -> IO.println(text)
			{:error, _, message} -> IO.report(message)
		end
	{:error, _} -> IO.report("task ended without a result")
end
```

This task returns text or an operation failure. Its outer error case describes
the task actor's exit. See [Actor scheduling](/std/actor#scheduling-and-process-lifetime)
for worker settings and blocking-call behavior.
