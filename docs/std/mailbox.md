# Mailbox

`Mailbox.Mailbox[M]` is the receiving end of one actor's typed queue.
`Actor.spawn` supplies it to that actor's body. Only its owner can receive from
it, and it does not implement `Send`.

## Functions

### Mailbox.receive

```el
Mailbox.receive[M](inbox: Mailbox.Mailbox[M]) -> M
```

Returns the next message in `inbox`, waiting without a limit until one
arrives. Call it only from the actor that owns `inbox`; it always reads the
calling actor's queue.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[i64] ->
	IO.println(Mailbox.receive(inbox))
end)
Actor.send(worker, 7)
```

### Mailbox.receive_within

```el
Mailbox.receive_within[M](inbox: Mailbox.Mailbox[M], millis: i64) -> {:ok, M} | :timeout
```

Returns `{:ok, message}` for the next message in `inbox`, waiting at most
`millis` milliseconds, or `:timeout` when none arrives. A `millis` of zero or
less checks once and does not wait. Call it only from the owning actor.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[i64] ->
	match Mailbox.receive_within(inbox, 1000) do
		{:ok, value} -> IO.println(value)
		:timeout -> IO.report("no message within one second")
	end
end)
Actor.send(worker, 7)
```

### Mailbox.pid

```el
Mailbox.pid[M](inbox: Mailbox.Mailbox[M]) -> Actor.Pid[M]
```

Returns the pid of the actor that owns `inbox`, the equivalent of Elixir's
`self()`. Send it to other actors so they can reply.

```el
worker = Actor.spawn(fn inbox: Mailbox.Mailbox[i64] ->
	self = Mailbox.pid(inbox)
	Actor.send(self, 7)
	IO.println(Mailbox.receive(inbox))
end)
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
