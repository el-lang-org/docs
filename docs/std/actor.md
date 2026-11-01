# Actor

Actors communicate through typed messages and have separate resource ownership.
`Actor.Pid[M]` addresses an actor that accepts messages of type `M`.
`Actor.Id` identifies an actor independently of its message type. Both support
`Eq` and `Show`; identities are never reused during a program's lifetime.

## Spawn and send

```el
Actor.spawn[M: Send](body: (Mailbox.Mailbox[M]) -> unit) -> Actor.Pid[M]
Actor.spawn_link[M: Send](body: (Mailbox.Mailbox[M]) -> unit) -> Actor.Pid[M]
Actor.start[M: Send, S: Send](state: S, handle: (M, S) -> {:continue, S} | :stop) -> Actor.Pid[M]
Actor.start_link[M: Send, S: Send](state: S, handle: (M, S) -> {:continue, S} | :stop) -> Actor.Pid[M]
Actor.loop[M, S](inbox: Mailbox.Mailbox[M], state: S, handle: (M, S) -> {:continue, S} | :stop) -> unit
Actor.send[M: Send](pid: Actor.Pid[M], message: M) -> unit
Actor.id[M](pid: Actor.Pid[M]) -> Actor.Id
Actor.self_id() -> Actor.Id
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

```el
Actor.call[M: Send, R](pid: Actor.Pid[M], request: (Actor.Reply[R]) -> M) -> {:ok, R} | {:error, Actor.Exit}
Actor.call_within[M: Send, R](pid: Actor.Pid[M], request: (Actor.Reply[R]) -> M, millis: i64) -> {:ok, R} | {:error, Actor.Exit} | :timeout
Actor.reply[R: Send](reply: Actor.Reply[R], value: R) -> unit
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
Actor.monitor[M, N](inbox: Mailbox.Mailbox[M], pid: Actor.Pid[N], on_down: (Actor.Exit) -> M) -> Actor.Monitor
Actor.demonitor(monitor: Actor.Monitor) -> unit
Actor.kill[M](pid: Actor.Pid[M]) -> unit
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

```el
Actor.link[N](pid: Actor.Pid[N]) -> unit
Actor.trap_exits[M](inbox: Mailbox.Mailbox[M], on_exit: (Actor.Id, Actor.Exit) -> M) -> unit
```

Links are bidirectional. A non-normal exit ends a linked actor with the same
reason. A normal exit has no effect on a partner that does not trap exits.
Linking to a dead actor sends `:noproc`; linking to yourself or linking twice
has no effect. Exit signals never end `main`.

`trap_exits` converts linked exit signals, including normal exits, to
`on_exit(id, reason)` messages. Call it from the mailbox's owner. Repeating the
call replaces the callback. A direct `Actor.kill` cannot be trapped.

## Typed names

```el
Actor.name[M]() -> Actor.Name[M]
Actor.register[M](name: Actor.Name[M], pid: Actor.Pid[M]) -> :ok | {:error, :taken} | {:error, :noproc}
Actor.whereis[M](name: Actor.Name[M]) -> Option[Actor.Pid[M]]
Actor.send_named[M: Send](name: Actor.Name[M], message: M) -> :ok | {:error, :noproc}
Actor.unregister[M](name: Actor.Name[M]) -> unit
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

```el
Actor.foreign_helper() -> Actor.Pid[unit]
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
