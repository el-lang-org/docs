# Net

`Net` provides TCP listeners and TCP or verified TLS client streams on the
supported Darwin arm64 target. `Net.Stream` implements `Reader` and `Writer`
with associated `ErrorReason` types. `Net.Listener` implements neither I/O protocol.

## Connections and listeners

### Net.connect

```el
Net.connect(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, :connection_refused | :host_not_found | :timed_out | :other, string}
```

Opens a plain TCP connection to `host` (a name, IPv4, or IPv6 address) on
`port`. `millis` is the deadline in milliseconds shared by name resolution and
the connection attempt. Addresses are tried in resolver order. Returns `{:ok,
stream}` or `{:error, reason, message}`. `reason` is `:connection_refused`
when nothing listens on the port, `:host_not_found` when `host` does not
resolve, `:timed_out` when `millis` passes (message `"timed out"`), and
`:other` for anything else, including an empty host or a negative `millis`.
The message names the host and port, for example `"connect 127.0.0.1:1:
Connection refused"`. The stream is a `Reader` and `Writer`; release it with
`Net.close`.

```el
match Net.connect("127.0.0.1", 8080, 1000) do
	{:ok, stream} ->
		defer do
			match Net.close(stream) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		IO.println("connected")
	{:error, _, message} -> IO.report(message)
end
```

### Net.connect_tls

```el
Net.connect_tls(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, :connection_refused | :host_not_found | :timed_out | :tls_failed | :certificate_invalid | :other, string}
```

Like `connect`, but performs a TLS handshake after connecting. The certificate
chain is checked against the system trust store and the host name is verified;
verification cannot be disabled. `millis` is the connect/handshake deadline.
Returns `{:ok, stream}` or `{:error, reason, message}` with the `connect`
reasons plus `:tls_failed` when the handshake fails and `:certificate_invalid`
when the certificate does not verify for `host`. Release with `Net.close`.

```el
match Net.connect_tls("example.com", 443, 30000) do
	{:ok, stream} ->
		defer do
			match Net.close(stream) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		IO.println("verified TLS connection")
	{:error, _, message} -> IO.report(message)
end
```

### Net.listen

```el
Net.listen(host: string, port: u16) -> {:ok, Net.Listener} | {:error, :address_in_use | :other, string}
```

Binds a TCP listener on `host` and `port` and starts listening (backlog 128,
address reuse on). Port `0` selects a free port; read it with
`Net.local_port`. Returns `{:ok, listener}` or `{:error, reason, message}`.
`reason` is `:address_in_use` when another socket holds the port and `:other`
for anything else, including an empty `host`, one containing a NUL character,
or one that does not resolve. The message names the host and port, for example
`"listen 127.0.0.1:8080: Address already in use"`. Release with `Net.close`.

```el
match Net.listen("127.0.0.1", 8080) do
	{:ok, listener} ->
		defer do
			match Net.close(listener) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		IO.println("listening on port 8080")
	{:error, _, message} -> IO.report(message)
end
```

### Net.accept

```el
Net.accept(listener: Net.Listener) -> {:ok, Net.Stream} | {:error, :closed | :other, string}
```

Waits, with no deadline, for the next connection to `listener` and returns
`{:ok, stream}` for it, or `{:error, reason, message}`: `:closed` (message
`"closed"`) if the listener was closed, `:other` for an OS failure. The stream
has no timeout until `Net.set_timeout`.

```el
match Net.listen("127.0.0.1", 8080) do
	{:ok, listener} ->
		defer do
			match Net.close(listener) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match Net.accept(listener) do
			{:ok, stream} ->
				match Net.close(stream) do
					{:ok, _} -> unit
					{:error, _, message} -> IO.report(message)
				end
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Net.local_port

```el
Net.local_port(listener: Net.Listener) -> {:ok, u16} | {:error, :closed | :other, string}
```

Returns `{:ok, port}`, the port `listener` is bound to (useful after listening
on port `0`), or `{:error, reason, message}`: `:closed` (message `"closed"`)
if the listener was closed, `:other` for an OS failure.

```el
match Net.listen("127.0.0.1", 8080) do
	{:ok, listener} ->
		defer do
			match Net.close(listener) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match Net.local_port(listener) do
			{:ok, port} -> IO.println(port)
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Net.set_timeout

```el
Net.set_timeout(stream: Net.Stream, millis: i64) -> {:ok, unit} | {:error, :closed | :other, string}
```

Sets the read and write timeout of `stream` to `millis` milliseconds; `0`
disables the timeout. Returns `{:ok, unit}`, or `{:error, reason, message}`:
`:closed` (message `"closed"`) for a closed stream, `:other` for a negative
`millis` or an OS failure. A read that then times out fails with `:timed_out`.

```el
match Net.connect("127.0.0.1", 8080, 1000) do
	{:ok, stream} ->
		defer do
			match Net.close(stream) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match Net.set_timeout(stream, 1000) do
			{:ok, _} -> IO.println("one-second read and write timeout")
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Net.close

```el
Net.close(socket: Net.Socket) -> {:ok, unit} | {:error, :closed | :other, string}
```

Closes a `Net.Stream` or `Net.Listener` and frees its buffers. Returns `{:ok,
unit}`, or `{:error, reason, message}`: `:closed` (message `"closed"`) when it
was already closed, `:other` when the OS reports a close failure. Every copy
of the handle becomes invalid.

```el
match Net.connect("127.0.0.1", 8080, 1000) do
	{:ok, stream} ->
		match Net.close(stream) do
			{:ok, _} -> IO.println("closed")
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

`Net.Socket` is `Net.Stream | Net.Listener`. Host names, IPv4, and IPv6 are
accepted. `connect` shares a deadline across resolution and connection
attempts. `set_timeout` configures reads and writes. Zero disables the timeout;
negative values return `{:error, :other, message}`.

`listen` uses `SO_REUSEADDR` and backlog 128. Port zero requests a free port,
reported by `local_port`. `accept` waits indefinitely; listener deadlines are
not implemented. Accepted streams have the same protocol and buffering behavior
as connected streams.

`connect_tls` checks the certificate chain against system trust and verifies
the host name. Verification cannot be disabled. The connection timeout includes
the handshake. A TLS timeout cancels and closes the stream. Server TLS, client
identities, and custom trust roots remain deferred.

## Stream I/O and cleanup

### Net.binread_line

```el
Net.binread_line(stream: Net.Stream) -> {:ok, bytes} | :eof | {:error, Net.ReadErrorReason, string}
```

Reads one line of bytes from `stream`, including the trailing `\n`; an
unterminated final line is returned before `:eof`. Returns `{:ok, bytes}`,
`:eof` when the peer has closed and nothing remains, or `{:error, reason,
message}`: `:timed_out` (message `"timed out"`) after the `Net.set_timeout`
deadline, `:closed` (message `"closed"`) for a closed stream,
`:connection_reset` when the peer reset the connection, and `:other` for
anything else. `Reader.read` on a stream fails with the same reasons and
shares its read-ahead buffer.

```el
match Net.connect("127.0.0.1", 8080, 1000) do
	{:ok, stream} ->
		defer do
			match Net.close(stream) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match Net.binread_line(stream) do
			{:ok, line} -> IO.println(Bytes.byte_size(line))
			:eof -> unit
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

Line reads include the newline and return an unterminated final line before
EOF. They share an 8192-byte read-ahead buffer with `Reader.read` and
`IO.read_all`. Writes consume all bytes or return an error. Flush does nothing
on an open stream. Interrupted host calls are retried, and sockets suppress SIGPIPE.

Copies alias the same socket and buffer. Only `Net.close` releases it; garbage
collection does not close sockets. Closing through one alias invalidates all
copies. Closed operations and repeated closes return `:closed`. Handles have
no `Eq`, `Ord`, `Hash`, or `Show` implementation.

## Failure reasons and ownership

```el
@type Net.ReadErrorReason = :timed_out | :closed | :connection_reset | :other
@type Net.WriteErrorReason = :timed_out | :closed | :connection_reset | :broken_pipe | :other
```

These are the associated reasons for `Reader` and `Writer` on `Net.Stream`.
Each operation has one `{:error, reason, message}` member. Network failures
without a listed reason become `:other`. Match the reason rather than parsing
the message. `:timed_out` and `:closed` use the constant messages `"timed out"`
and `"closed"`.

Sockets belong to the actor that opened or accepted them and do not implement
`Send`. Open a connection inside the actor that uses it. The runtime closes an
actor's sockets when the actor ends. On Darwin arm64, socket, connection, and
TLS waits park green actors so other actors can run on the worker.

The [local TCP example](https://github.com/el-lang-org/el/tree/main/examples/net_http#tcp-echo)
includes listener setup, client connection, timeouts, byte I/O, and cleanup.
