# Supervisor

`Supervisor` keeps a fixed set of child actors running with one-for-one
restarts. Each child has a typed [Actor name](/std/actor#typed-names), which
stays the same across replacements.

## Functions

```el
@type Supervisor.Event = {:child_exit, Actor.Id, Actor.Exit} | :stop
Supervisor.child[M: Send](name: Actor.Name[M], body: (Mailbox.Mailbox[M]) -> unit) -> Supervisor.Child
Supervisor.start(children: [Supervisor.Child], max_restarts: usize, within_millis: i64) -> Actor.Pid[Supervisor.Event]
Supervisor.start_link(children: [Supervisor.Child], max_restarts: usize, within_millis: i64) -> Actor.Pid[Supervisor.Event]
Supervisor.stop(supervisor: Actor.Pid[Supervisor.Event]) -> unit
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
