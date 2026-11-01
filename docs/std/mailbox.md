# Mailbox

`Mailbox.Mailbox[M]` is the receiving end of one actor's typed queue.
`Actor.spawn` supplies it to that actor's body. Only its owner can receive from
it, and it does not implement `Send`.

## Functions

```el
Mailbox.receive[M](inbox: Mailbox.Mailbox[M]) -> M
Mailbox.receive_within[M](inbox: Mailbox.Mailbox[M], millis: i64) -> {:ok, M} | :timeout
Mailbox.pid[M](inbox: Mailbox.Mailbox[M]) -> Actor.Pid[M]
```

`receive` waits without a limit for the next message. `receive_within` waits up
to `millis` milliseconds. Zero or less checks once without waiting.
`pid` returns the owner's typed address, which can be sent to another actor
for replies.

Receive consumes messages in queue order, with no selective receive. Messages
from one sender retain send order. Monitor events and trapped exits arrive as
ordinary messages through their registered callbacks. Using an owned mailbox
from a different actor fails with `not_owner`.

See [Actors and tasks](/getting-started/concurrency) for a complete example.
