# Supervisor

`Supervisor` keeps a fixed set of child actors running with one-for-one
restarts. Each child has a typed [Actor name](/std/actor#typed-names), which
stays the same across replacements.

## Functions

```el
@type Supervisor.Event = {:child_exit, Actor.Id, Actor.Exit} | :stop
```

### Supervisor.child

```el
Supervisor.child[M: Send](name: Actor.Name[M], body: (Mailbox.Mailbox[M]) -> unit) -> Supervisor.Child
```

Describes a child that runs `body` with its own mailbox for messages of type
`M`. Each start spawns the body linked to the supervisor and binds `name` to
it. `body` runs again from the start after every restart, with an empty
mailbox; messages queued for the old child are lost.

```el
name: Actor.Name[unit] = Actor.name()
child = Supervisor.child(name, fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
```

### Supervisor.start

```el
Supervisor.start(children: [Supervisor.Child], max_restarts: usize, within_millis: i64) -> Actor.Pid[Supervisor.Event]
```

Starts a supervisor actor that starts every child in `children`, in order, and
returns its pid. `max_restarts` is how many restarts are allowed within any
window of `within_millis` milliseconds; one more ends the supervisor. The
window is counted over all children together, from `Time.monotonic_nanos`. A
`max_restarts` of zero allows none. The supervisor is not linked to the
caller.

```el
name: Actor.Name[unit] = Actor.name()
child = Supervisor.child(name, fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
supervisor = Supervisor.start([child], 3, 5000)
Supervisor.stop(supervisor)
```

### Supervisor.start_link

```el
Supervisor.start_link(children: [Supervisor.Child], max_restarts: usize, within_millis: i64) -> Actor.Pid[Supervisor.Event]
```

Starts the fixed child set with the same restart limit as
`Supervisor.start` and links the supervisor to its caller. When the caller
ends, the supervisor kills its children and ends. Exceeding the restart limit
sends a `:killed` exit signal to the linked caller unless it traps exits.

```el
name: Actor.Name[unit] = Actor.name()
child = Supervisor.child(name, fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
supervisor = Supervisor.start_link([child], 3, 5000)
Supervisor.stop(supervisor)
```

### Supervisor.stop

```el
Supervisor.stop(supervisor: Actor.Pid[Supervisor.Event]) -> unit
```

Asks the supervisor to kill its children and end with `:normal`. Returns
`unit` at once. Sending to a supervisor that has ended does nothing.

```el
name: Actor.Name[unit] = Actor.name()
child = Supervisor.child(name, fn inbox: Mailbox.Mailbox[unit] -> Mailbox.receive(inbox) end)
supervisor = Supervisor.start([child], 3, 5000)
Supervisor.stop(supervisor)
```

`child` describes how to start a child and register its name. `start` starts
the children in list order, links them to the supervisor, and returns the
supervisor's pid. Every child exit, including `:normal`, restarts that child
from the beginning with an empty mailbox. Messages queued for the old child
are lost. Clients use `Actor.whereis` or `Actor.send_named` to find the current
replacement.

The supervisor allows `max_restarts` within a `within_millis` millisecond
window across all children. The next restart beyond that limit kills all
children and ends the supervisor with `:killed`. A limit of zero allows no
restarts. Time windows use the monotonic clock.

`start` does not link to its caller. `start_link` does; when the caller ends,
the supervisor kills its children and ends. `stop` requests child shutdown and
normal supervisor exit without waiting. Killing a supervisor also reaches its
linked children.

Restart strategies other than one-for-one, dynamic child sets, and state or
mailbox transfer are not implemented.
