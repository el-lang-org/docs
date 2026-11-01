# Net

`Net` provides TCP listeners and TCP or verified TLS client streams on the
supported Darwin arm64 target. `Net.Stream` implements `Reader` and `Writer`
with associated `ErrorReason` types. `Net.Listener` implements neither I/O protocol.

## Connections and listeners

```el
Net.connect(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, :connection_refused | :host_not_found | :timed_out | :other, string}
Net.connect_tls(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, :connection_refused | :host_not_found | :timed_out | :tls_failed | :certificate_invalid | :other, string}
Net.listen(host: string, port: u16) -> {:ok, Net.Listener} | {:error, :address_in_use | :other, string}
Net.accept(listener: Net.Listener) -> {:ok, Net.Stream} | {:error, :closed | :other, string}
Net.local_port(listener: Net.Listener) -> {:ok, u16} | {:error, :closed | :other, string}
Net.set_timeout(stream: Net.Stream, millis: i64) -> {:ok, unit} | {:error, :closed | :other, string}
Net.close(socket: Net.Socket) -> {:ok, unit} | {:error, :closed | :other, string}
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

```el
Net.binread_line(stream: Net.Stream) -> {:ok, bytes} | :eof | {:error, Net.ReadErrorReason, string}
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
