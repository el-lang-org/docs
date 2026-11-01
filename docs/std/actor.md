# Actor

Actors communicate through typed messages and have separate resource ownership.
`Actor.Pid[M]` addresses an actor that accepts messages of type `M`.
`Actor.Id` identifies an actor independently of its message type. Both support
`Eq` and `Show`; identities are never reused during a program's lifetime.

## Spawn and send

### Actor.spawn

```el
Actor.spawn[M: Send](body: (Mailbox.Mailbox[M]) -> unit) -> Actor.Pid[M]
```

Starts an actor that runs `body` with its own mailbox, and returns its pid.
`M` is the type of message the actor accepts and must be `Send`. A closure
literal passed here may capture only `Send` values.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[i64] ->
	IO.println(Mailbox.receive(inbox))
end)
Actor.send(worker, 7)
```

### Actor.spawn_link

```el
Actor.spawn_link[M: Send](body: (Mailbox.Mailbox[M]) -> unit) -> Actor.Pid[M]
```

Starts `body` with its own mailbox, as `Actor.spawn` does, and links the
new actor to the caller before the child starts. A non-normal exit propagates
through the link unless the receiving actor traps exits. Closure captures and
messages follow the `Send` rules.

```el
worker = Actor.spawn_link(fn inbox: Mailbox.Mailbox[i64] ->
	IO.println(Mailbox.receive(inbox))
end)
Actor.send(worker, 7)
```

### Actor.start

```el
Actor.start[M: Send, S: Send](state: S, handle: (M, S) -> {:continue, S} | :stop) -> Actor.Pid[M]
```

Starts an actor that keeps `state` and calls `handle(message, state)` for each
message, in order. `handle` returns `{:continue, next_state}` to wait for the
next message or `:stop` to end the actor. Annotate the message type on the
first clause of `handle` (`{:add, n}: Msg`) so `M` is known.

```el
counter = Actor.start(0, fn message: i64, total: i64 ->
	{:continue, total + message}
end)
Actor.send(counter, 5)
```

### Actor.start_link

```el
Actor.start_link[M: Send, S: Send](state: S, handle: (M, S) -> {:continue, S} | :stop) -> Actor.Pid[M]
```

Starts a stateful receive loop with `state` and `handle`, as `Actor.start`
does, and links the new actor to its caller before it starts. The handler
returns `{:continue, next_state}` to continue or `:stop` to finish.

```el
counter = Actor.start_link(0, fn message: i64, total: i64 ->
	{:continue, total + message}
end)
Actor.send(counter, 5)
```

### Actor.loop

```el
Actor.loop[M, S](inbox: Mailbox.Mailbox[M], state: S, handle: (M, S) -> {:continue, S} | :stop) -> unit
```

Runs the receive loop of a stateful actor inside `inbox`'s owner: receives a
message, calls `handle(message, state)`, and repeats with the returned state
until `handle` returns `:stop`. Returns `unit` after `:stop`.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[i64] ->
	Actor.loop(inbox, 0, fn message: i64, total: i64 ->
		if message == 0 do :stop else {:continue, total + message} end
	end)
end)
Actor.send(worker, 5)
Actor.send(worker, 0)
```

### Actor.send

```el
Actor.send[M: Send](pid: Actor.Pid[M], message: M) -> unit
```

Sends `message` to `pid` and returns `unit` at once. The message is queued
behind earlier ones from the same sender. If the actor has ended, the message
is dropped and nothing is reported. `M` must be `Send`.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.send(worker, unit)
```

### Actor.id

```el
Actor.id[M](pid: Actor.Pid[M]) -> Actor.Id
```

Returns the id of `pid`. Compare ids with `==`.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
identity = Actor.id(worker)
Actor.send(worker, unit)
```

### Actor.self_id

```el
Actor.self_id() -> Actor.Id
```

Returns the id of the calling actor. In `main` it shows as `#Pid<1>`.

```el
IO.println(Actor.self_id()) # #Pid<1> in main
```

`spawn` runs `body` in a new actor with its own mailbox. `start` runs a stateful
receive loop. Annotate the handler's message parameter so the compiler can
infer `M`. Each handler returns `{:continue, next_state}` or `:stop`.
`loop` runs that receive loop inside an existing mailbox's owner.

The `_link` variants link the child to its caller before the child starts.
`send` queues a message and returns immediately. Messages from one sender
arrive in send order. Sending to a dead actor silently drops the message.

Messages and initial state must satisfy the compiler-derived `Send` protocol.
Resources such as file handles, sockets, and foreign memory belong to one
actor. Open them inside the actor that uses them. A closure literal passed
directly to `spawn` or `start` cannot capture an owned resource.

## Calls and replies

### Actor.call

```el
Actor.call[M: Send, R](pid: Actor.Pid[M], request: (Actor.Reply[R]) -> M) -> {:ok, R} | {:error, Actor.Exit}
```

Sends `request(reply)` to `pid` and waits without a limit for the callee to
call `Actor.reply` on that `Reply`. Returns `{:ok, value}` for the reply, or
`{:error, reason}` when the callee ends before it replies, where `reason` is
its `Exit` (`:noproc` when it was already gone). Messages that other actors
send to the caller meanwhile stay queued, unread and in order. Call it from an
actor, including `main`.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[Actor.Reply[i64]] ->
	Actor.reply(Mailbox.receive(inbox), 42)
end)
match Actor.call(worker, fn reply: Actor.Reply[i64] -> reply end) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("worker ended without replying")
end
```

### Actor.call_within

```el
Actor.call_within[M: Send, R](pid: Actor.Pid[M], request: (Actor.Reply[R]) -> M, millis: i64) -> {:ok, R} | {:error, Actor.Exit} | :timeout
```

As `call`, and also returns `:timeout` when no reply or exit arrives within
`millis` milliseconds (a `millis` of zero or less checks once). After a
timeout the call is over: a reply that arrives later is dropped and never
reaches the caller's mailbox.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[Actor.Reply[i64]] ->
	Actor.reply(Mailbox.receive(inbox), 42)
end)
match Actor.call_within(worker, fn reply: Actor.Reply[i64] -> reply end, 1000) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("worker ended without replying")
	:timeout -> IO.report("no reply within one second")
end
```

### Actor.reply

```el
Actor.reply[R: Send](reply: Actor.Reply[R], value: R) -> unit
```

Answers the call that created `reply` with `value`. Only the first reply to a
`Reply` counts. The value is dropped, and nothing is reported, when `reply`
already has an answer, when the caller stopped waiting (a timeout), or when
the caller has ended. `R` must be `Send`.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[Actor.Reply[i64]] ->
	Actor.reply(Mailbox.receive(inbox), 42)
end)
match Actor.call(worker, fn reply: Actor.Reply[i64] -> reply end) do
	{:ok, value} -> IO.println(value)
	{:error, _} -> IO.report("worker ended without replying")
end
```

`call` creates a one-shot reply slot, sends `request(slot)`, and waits for a
reply or the callee's exit. Annotate the request closure's parameter, such as
`fn reply: Actor.Reply[i64] -> {:get, reply} end`, to fix `R`.

Calls leave the caller's mailbox unread. Only the first reply succeeds. A reply
that arrives after a call timeout is dropped, and a filled reply wins over a
subsequent exit. A dead target returns `{:error, :noproc}`. `call_within` waits
up to `millis` milliseconds; zero or less checks once without waiting.

`Actor.Reply[R]` is sendable so a request can carry it to another actor.
See the [counter example](/getting-started/concurrency#call-a-stateful-actor).

## Monitor and kill

```el
@type Actor.Exit = :normal | :killed | :noproc | {:panic, string} | {:foreign_crash, i32}
```

### Actor.monitor

```el
Actor.monitor[M, N](inbox: Mailbox.Mailbox[M], pid: Actor.Pid[N], on_down: (Actor.Exit) -> M) -> Actor.Monitor
```

Watches the actor behind `pid`. When it ends, `inbox` receives
`on_down(reason)` as an ordinary message, where `reason` is an `Exit`:
`:normal` after a normal end, `{:panic, message}` after a runtime failure, or
`:noproc` at once when the actor is already dead or unknown. The event is
delivered once, after the actor's resources are closed. Call it only from the
actor that owns `inbox`.

```el
watcher = Actor.spawn(fn inbox: Mailbox.Mailbox[Actor.Exit] ->
	worker = Actor.spawn(fn messages: Mailbox.Mailbox[unit] -> Mailbox.receive(messages) end)
	monitor = Actor.monitor(inbox, worker, fn reason: Actor.Exit -> reason end)
	Actor.kill(worker)
	match Mailbox.receive(inbox) do
		:killed -> IO.println("killed")
		_ -> unit
	end
end)
```

### Actor.demonitor

```el
Actor.demonitor(monitor: Actor.Monitor) -> unit
```

Cancels `monitor`. After the call returns, its down event never arrives, even
if the watched actor ended a moment before. Cancelling twice, or after the
event was received, does nothing. Call it only from the actor that made the
monitor.

```el
watcher = Actor.spawn(fn inbox: Mailbox.Mailbox[Actor.Exit] ->
	worker = Actor.spawn(fn messages: Mailbox.Mailbox[unit] -> Mailbox.receive(messages) end)
	monitor = Actor.monitor(inbox, worker, fn reason: Actor.Exit -> reason end)
	Actor.demonitor(monitor)
	Actor.kill(worker)
end)
```

### Actor.kill

```el
Actor.kill[M](pid: Actor.Pid[M]) -> unit
```

Asks the actor behind `pid` to end. It ends with `:killed` at its next
safepoint (a function entry or loop pass) outside a critical section, or at
once if it is blocked in a mailbox wait, a socket or file read, or a TLS wait.
Its `defer` work does not run; the runtime closes the resources it owns and
its monitors fire. Returns `unit` at once without waiting. Killing an actor
that has ended, or `main`, does nothing; killing yourself ends you.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.kill(worker)
```

A monitor delivers `on_down(reason)` once as an ordinary mailbox message after
the target's resources close. Its callback runs in the receiving actor. A dead
or unknown target produces `:noproc` immediately. The monitor belongs to its
creator. After `demonitor` returns, no event from that monitor is received,
including an event already queued.

An actor that returns exits with `:normal`. Runtime failures in a child actor
produce `{:panic, category}`, such as `{:panic, "integer_overflow"}`. Stack
overflow uses `{:panic, "stack overflow"}`. The source span is reported on
standard error. These failures end that actor. Failures in `main`, allocation
exhaustion, and failures during runtime critical or blocking sections end the process.

`Actor.Exit` is a union without `Show`. Match its members before formatting
details, such as the category inside `{:panic, category}`.

`kill` requests `:killed` without waiting. The actor stops at a safepoint outside
a critical section, or wakes from an interruptible wait. Skipped `defer`
actions do not run; the runtime closes owned resources and notifies monitors.
Killing `main` or an already dead actor has no effect. A non-isolated foreign
call must return before its actor can stop.

## Links and trapped exits

### Actor.link

```el
Actor.link[N](pid: Actor.Pid[N]) -> unit
```

Links the calling actor to the actor behind `pid`, in both directions. When
one ends with a reason other than `:normal` (a panic, a stack overflow, or a
kill), the other ends with the same reason; `:normal` is ignored. An actor
that calls `trap_exits` receives every signal, `:normal` included, as a
message instead. Linking to an actor that has ended, or to yourself, never
waits: a dead target sends the caller a `:noproc` signal at once, and linking
to yourself or twice does nothing. `main` is never ended by a signal.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.link(worker)
Actor.send(worker, unit)
```

### Actor.trap_exits

```el
Actor.trap_exits[M](inbox: Mailbox.Mailbox[M], on_exit: (Actor.Id, Actor.Exit) -> M) -> unit
```

Makes the calling actor receive exit signals from linked actors as messages,
so a failure of a linked actor no longer ends it. `inbox` receives
`on_exit(id, reason)`, where `id` is the `Id` of the actor that ended (compare
with `Actor.id(pid)`) and `reason` is its `Exit`. A kill (`Actor.kill`) cannot
be trapped. Calling it again replaces `on_exit`. Call it only from the actor
that owns `inbox`.

```el
watcher = Actor.spawn(fn inbox: Mailbox.Mailbox[{Actor.Id, Actor.Exit}] ->
	Actor.trap_exits(inbox, fn id: Actor.Id, reason: Actor.Exit -> {id, reason} end)
	unit
end)
```

Links are bidirectional. A non-normal exit ends a linked actor with the same
reason. A normal exit has no effect on a partner that does not trap exits.
Linking to a dead actor sends `:noproc`; linking to yourself or linking twice
has no effect. Exit signals never end `main`.

`trap_exits` converts linked exit signals, including normal exits, to
`on_exit(id, reason)` messages. Call it from the mailbox's owner. Repeating the
call replaces the callback. A direct `Actor.kill` cannot be trapped.

## Typed names

### Actor.name

```el
Actor.name[M]() -> Actor.Name[M]
```

Creates a name that no earlier call returned. Choose `M` by annotating the
binding. The name is free until `register` binds it.

```el
name: Actor.Name[unit] = Actor.name()
```

### Actor.register

```el
Actor.register[M](name: Actor.Name[M], pid: Actor.Pid[M]) -> :ok | {:error, :taken} | {:error, :noproc}
```

Binds `name` to the actor behind `pid`, from any actor. Returns `:ok`, also
when `pid` already holds the name. Returns `{:error, :taken}` when another
live actor holds it, and `{:error, :noproc}` when `pid` has ended. The name is
freed when the actor ends, before any monitor or link signal about it goes
out, so a supervisor that hears of the exit can bind the name again at once.
An actor may hold several names.

```el
name: Actor.Name[unit] = Actor.name()
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
match Actor.register(name, worker) do
	:ok -> Actor.send(worker, unit)
	{:error, :taken} -> IO.report("name already registered")
	{:error, :noproc} -> IO.report("actor already ended")
end
```

### Actor.whereis

```el
Actor.whereis[M](name: Actor.Name[M]) -> Option[Actor.Pid[M]]
```

Returns `{:some, pid}` for the live actor that holds `name`, or `:none` when
nobody does, for example while a supervisor is restarting the child. Look the
name up again before each use; a `Pid` from an earlier lookup names the old
actor.

```el
name: Actor.Name[unit] = Actor.name()
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.register(name, worker)
match Actor.whereis(name) do
	{:some, current} -> Actor.send(current, unit)
	:none -> IO.report("no actor registered")
end
```

### Actor.send_named

```el
Actor.send_named[M: Send](name: Actor.Name[M], message: M) -> :ok | {:error, :noproc}
```

Sends `message` to the actor that holds `name`. Returns `:ok` when the name
was bound (the message is queued, or dropped if that actor ends first) and
`{:error, :noproc}` when nobody holds it. `M` must be `Send`.

```el
name: Actor.Name[unit] = Actor.name()
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.register(name, worker)
result = Actor.send_named(name, unit) # :ok while registered
```

### Actor.unregister

```el
Actor.unregister[M](name: Actor.Name[M]) -> unit
```

Frees `name` now, whoever holds it. Does nothing when nobody holds it. An
actor's names are freed automatically when it ends; call this to give a name
up earlier.

```el
name: Actor.Name[unit] = Actor.name()
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
Actor.register(name, worker)
Actor.unregister(name)
Actor.send(worker, unit)
```

Each `name()` call creates a fresh typed identity. Fix its message type with an
annotation, such as `name: Actor.Name[Message] = Actor.name()`. Names have no
text spelling. Registration of the current holder succeeds again; a different
live holder returns `:taken`, and a dead target returns `:noproc`.

Names are released before exit notifications. A [Supervisor](/std/supervisor)
can register a replacement under the same name. Clients look up the name again
to reach that replacement. `unregister` removes the binding regardless of its
current holder.

## Isolated foreign helper

### Actor.foreign_helper

```el
Actor.foreign_helper() -> Actor.Pid[unit]
```

Returns the actor that stands for the helper process of the program's isolated
foreign libraries, starting the helper if it is not running. Watch it with
`Actor.monitor` to see a crash as `{:foreign_crash, signal}`; `Actor.kill` on
it ends the process with signal 9. After a crash the next call, or the next
call to this function, starts a new helper with a new pid. The helper takes no
messages. A program with no isolated library has no helper: the returned pid
is dead and a monitor on it reports `:noproc`.

```el
helper = Actor.foreign_helper()
identity = Actor.id(helper)
```

Returns the actor identity of the program's isolated FFI helper, starting it
if needed. It accepts no messages. Monitors and links observe helper crashes
as `{:foreign_crash, signal}`. Killing it sends signal 9. A later call starts
a fresh helper and identity. Without isolated libraries, the returned pid is
dead. See [Isolate a native library](/std/ffi#isolate-a-native-library).

## Scheduling and process lifetime

On Darwin arm64, actors use green threads on a work-stealing scheduler.
`EL_WORKERS=<n>` selects the worker count, which defaults to one per core.
`EL_SCHEDULER=threads` selects one OS thread per actor. Other targets and
sanitizer builds use OS threads. Socket, connection, TLS, and isolated FFI waits
park green actors; DNS resolution and non-isolated foreign calls can block a
worker.

When `main` returns, the process ends and remaining actors stop without cleanup.
Wait for required work before returning from `main`.
