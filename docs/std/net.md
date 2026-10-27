# Net

`Net` provides TCP listeners and TCP or verified TLS client streams on the
supported Darwin arm64 target. `Net.Stream` implements `Reader` and `Writer`
with associated `Net.Error`. `Net.Listener` implements neither I/O protocol.

## Connections and listeners

```el
Net.connect(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, Net.Error}
Net.connect_tls(host: string, port: u16, millis: i64) -> {:ok, Net.Stream} | {:error, Net.Error}
Net.listen(host: string, port: u16) -> {:ok, Net.Listener} | {:error, Net.Error}
Net.accept(listener: Net.Listener) -> {:ok, Net.Stream} | {:error, Net.Error}
Net.local_port(listener: Net.Listener) -> {:ok, u16} | {:error, Net.Error}
Net.set_timeout(stream: Net.Stream, millis: i64) -> {:ok, unit} | {:error, Net.Error}
Net.close(socket: Net.Socket) -> {:ok, unit} | {:error, Net.Error}
```

`Net.Socket` is `Net.Stream | Net.Listener`. Host names, IPv4, and IPv6 are
accepted. `connect` shares a deadline across resolution and connection
attempts. `set_timeout` configures reads and writes. Zero disables the timeout;
negative values return `:invalid_input`.

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
Net.binread_line(stream: Net.Stream) -> {:ok, bytes} | :eof | {:error, Net.Error}
```

Line reads include the newline and return an unterminated final line before
EOF. They share an 8192-byte read-ahead buffer with `Reader.read` and
`IO.read_all`. Writes consume all bytes or return an error. Flush does nothing
on an open stream. Interrupted host calls are retried, and sockets suppress SIGPIPE.

Copies alias the same socket and buffer. Only `Net.close` releases it; garbage
collection does not close sockets. Closing through one alias invalidates all
copies. Closed operations and repeated closes return `:closed`. Handles have
no `Eq`, `Ord`, `Hash`, or `Show` implementation.

## Errors

```el
Net.error_kind(error: Net.Error) -> Net.ErrorKind
Net.error_operation(error: Net.Error) -> Net.Operation
Net.error_code(error: Net.Error) -> Option[i64]
```

`Net.ErrorKind` is the closed union `:connection_refused | :connection_reset |
:timed_out | :host_not_found | :address_in_use | :address_not_available |
:closed | :broken_pipe | :invalid_input | :tls_failed | :certificate_invalid |
:other`. `Net.Operation` is `:resolve | :connect | :handshake | :listen |
:accept | :read | :write | :close | :configure`.

Errors implement `Eq`, `Hash`, and `Show`. Inspect kinds and operations rather
than parsing text or depending on target-specific codes.

The [local TCP example](https://github.com/el-lang-org/el/tree/main/examples/net_http#tcp-echo)
includes listener setup, client connection, timeouts, byte I/O, and cleanup.
