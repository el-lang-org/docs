# Http

`Http` implements bounded HTTP/1.1 messages, a client, and a sequential server
in EL over [Net](/std/net). Bodies are bytes; metadata is UTF-8 text.

## Message types

```el
struct Request do
	method: string
	request_path: string
	query_string: string
	req_headers: [{string, string}]
	body: bytes
end

struct Response do
	status: u16
	resp_headers: [{string, string}]
	resp_body: bytes
end
```

These types belong to `Http`: construct `%Http.Request{...}` or
`%Http.Response{...}`. Headers preserve wire order.

Failures use `{:error, reason, message}`. Network reasons propagate directly
alongside HTTP reasons. Messages contain details such as the malformed field
or unsupported scheme; their wording is not a control-flow contract.

```el
@type Http.ReadErrorReason =
	:malformed | :header_too_large | :body_too_large | :timed_out | :closed | :connection_reset | :other
@type Http.RequestErrorReason =
	:malformed | :header_too_large | :body_too_large | :unsupported_scheme |
	:connection_refused | :host_not_found | :timed_out | :tls_failed |
	:certificate_invalid | :closed | :connection_reset | :other
```

## Client

### Http.request

```el
Http.request(method: string, url: string, headers: [{string, string}], body: bytes) -> {:ok, Http.Response} | {:error, Http.RequestErrorReason, string}
```

Performs a complete HTTP/1.1 request and returns the final response. `url`
must be `http://` or `https://` (default ports 80 and 443) and must not
contain a `#` fragment. `headers` are extra request headers as `{name, value}`
pairs; `Connection: close` is added. `body` is sent as the request body.
Connects with a 30000 ms timeout and applies a 30000 ms read/write timeout,
then closes the connection. Skips interim 1xx responses (except 101). Returns
`{:ok, Response}` or `{:error, reason, message}` with a
`Http.RequestErrorReason`: `:unsupported_scheme` for a scheme other than
`http` or `https`, `:malformed` for a bad URL or response,
`:header_too_large`, `:body_too_large`, a `Net.connect_tls` reason such as
`:connection_refused`, or a read or write failure (`:timed_out`, `:closed`,
`:connection_reset`, `:other`). Redirects are not followed and non-2xx
statuses are `:ok`.

```el
match Http.request("GET", "http://127.0.0.1:8080/", [{"Accept", "text/plain"}], <<>>) do
	{:ok, response} -> IO.println(response.status)
	{:error, _, message} -> IO.report(message)
end
```

### Http.get

```el
Http.get(url: string) -> {:ok, Http.Response} | {:error, Http.RequestErrorReason, string}
```

Sends a GET to `url` with no body. See `Http.request` for the URL rules,
timeouts, and errors.

```el
match Http.get("http://127.0.0.1:8080/") do
	{:ok, response} -> IO.println(response.status)
	{:error, _, message} -> IO.report(message)
end
```

### Http.post

```el
Http.post(url: string, content_type: string, body: bytes) -> {:ok, Http.Response} | {:error, Http.RequestErrorReason, string}
```

Sends a POST to `url` with the `Content-Type` header set to `content_type` and
`body` as the body. See `Http.request` for the URL rules, timeouts, and
errors.

```el
match Http.post("http://127.0.0.1:8080/", "text/plain", String.bytes("hello")) do
	{:ok, response} -> IO.println(response.status)
	{:error, _, message} -> IO.report(message)
end
```

URLs accept HTTP and HTTPS, optional decimal ports, bracketed IPv6 hosts, paths,
and encoded queries. Default ports are 80 and 443. A missing path becomes `/`.
User info, fragments, and empty hosts are rejected. Other schemes return
`{:error, :unsupported_scheme, message}` with the scheme in the message.

Each call opens and closes one connection with 30-second connection, read, and
write timeouts. HTTPS verifies system trust and the host name. The client sets
Host, Content-Length, and `Connection: close`, validates metadata before
replacement, and skips informational responses except 101. Redirects, pooling,
decompression, cookies, and proxies are deferred.

```el
match Http.get("http://127.0.0.1:8080/hello") do
	{:ok, response} ->
		IO.println(response.status)
		match String.from_bytes(response.resp_body) do
			{:ok, text} -> IO.println(text)
			{:error, :invalid_utf8, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

## Server

### Http.serve

```el
Http.serve(listener: Net.Listener, handler: (Http.Request) -> Http.Response) -> {:error, :closed | :other, string}
```

Runs `serve_one` in a loop on `listener`, serving connections one at a time
and ignoring per-connection errors. Never returns normally; returns `{:error,
reason, message}` only when `Net.accept` fails: `:closed` when the listener
was closed, or `:other`. The listener is not closed.

```el
match Net.listen("127.0.0.1", 8080) do
	{:ok, listener} ->
		defer do
			match Net.close(listener) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		handler = fn request: Http.Request -> Http.response(200, "hello\n") end
		match Http.serve(listener, handler) do
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Http.serve_one

```el
Http.serve_one(listener: Net.Listener, handler: (Http.Request) -> Http.Response) -> {:ok, unit} | {:error, :timed_out | :closed | :connection_reset | :other, string}
```

Accepts one connection from `listener`, reads one request, answers it with
`handler(request)`, and closes that connection (`Connection: close`). Applies
a 30000 ms read/write timeout to the accepted connection. A malformed request
is answered with 400 (431 for oversized headers, 413 for an oversized body)
without calling `handler`; a response that cannot be encoded becomes a 500.
Returns `{:ok, unit}`, or `{:error, reason, message}` when accepting or using
the connection fails: `:closed` for a closed listener or stream, `:timed_out`
after the read/write timeout, `:connection_reset` when the client reset the
connection, or `:other`. The listener stays open.

```el
match Net.listen("127.0.0.1", 8080) do
	{:ok, listener} ->
		defer do
			match Net.close(listener) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		handler = fn request: Http.Request -> Http.response(200, "hello\n") end
		match Http.serve_one(listener, handler) do
			{:ok, _} -> IO.println("served one connection")
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Http.response

```el
Http.response(status: u16, body: string) -> Http.Response
```

Builds a `Response` with `status` and a `text/plain; charset=utf-8` body of
`body` (UTF-8 encoded). Use `Http.put_header` to add headers.

```el
response = Http.response(200, "hello\n")
IO.println(response.status) # 200
```

The caller owns and closes the listener. Http closes each accepted stream after
one request and response. Acceptance waits indefinitely; accepted streams have
30-second read and write timeouts. Processing is sequential. A valid request
invokes the handler exactly once, and handlers may capture values in closures.

`serve_one` returns the connection result. `serve` continues after connection
errors and returns only when acceptance fails. Malformed requests receive 400,
oversized headers 431, and oversized bodies 413. An unencodable handler response
becomes 500 before writing. A successful error response counts as success.

`response` encodes a string as UTF-8 with
`Content-Type: text/plain; charset=utf-8`. HEAD responses retain the encoded
Content-Length and omit the body. Server TLS, concurrency, keep-alive, and
streaming bodies remain deferred.

The [local HTTP example](https://github.com/el-lang-org/el/tree/main/examples/net_http#http-hello-and-post-echo)
runs GET and POST clients and a server without an external service.

## Headers and codec

### Http.header

```el
Http.header(headers: [{string, string}], name: string) -> Option[string]
```

Returns `{:some, value}` for the first header in `headers` whose name equals
`name`, compared ASCII case-insensitively, or `:none` if there is none.

```el
value = Http.header([{"Content-Type", "text/plain"}], "content-type")
# {:some, "text/plain"}
```

### Http.put_header

```el
Http.put_header(headers: [{string, string}], name: string, value: string) -> [{string, string}]
```

Returns `headers` with every existing header named `name` (case-insensitive)
removed and `{name, value}` appended at the end. `headers` is unchanged.

```el
headers = Http.put_header([{"X-Mode", "old"}], "x-mode", "new")
# [{"x-mode", "new"}]
```

### Http.encode_request

```el
Http.encode_request(request: Http.Request, host: string) -> {:ok, bytes} | {:error, :malformed | :header_too_large | :body_too_large, string}
```

Serializes `request` to wire bytes for the server named by `host` (the `Host`
header value, such as `"example.com:8080"`). Sets `Host` and `Content-Length`
and drops any `Transfer-Encoding` header. Returns `{:ok, bytes}`, or `{:error,
reason, message}`: `:malformed` for an invalid method, path, query, host, or
header, or `:header_too_large` / `:body_too_large` past the limits (8192-byte
lines, 100 headers, 16 MiB body).

```el
request = %Http.Request{method: "GET", request_path: "/", query_string: "", req_headers: [], body: <<>>}
match Http.encode_request(request, "example.com") do
	{:ok, data} -> IO.println(Bytes.byte_size(data))
	{:error, _, message} -> IO.report(message)
end
```

### Http.encode_response

```el
Http.encode_response(response: Http.Response) -> {:ok, bytes} | {:error, :malformed | :header_too_large | :body_too_large, string}
```

Serializes `response` to wire bytes, setting `Content-Length` and dropping any
`Transfer-Encoding` header. Returns `{:ok, bytes}`, or `{:error, reason,
message}`: `:malformed` when the status is outside 100 to 999, the status
forbids a body (1xx, 204, 304) but one is present, or a header is invalid, or
`:header_too_large` / `:body_too_large` past the limits.

```el
match Http.encode_response(Http.response(200, "hello")) do
	{:ok, data} -> IO.println(Bytes.byte_size(data))
	{:error, _, message} -> IO.report(message)
end
```

### Http.read_request

```el
Http.read_request(stream: Net.Stream) -> {:ok, Http.Request} | {:error, Http.ReadErrorReason, string}
```

Reads one HTTP/1.1 request from `stream`: request line, headers, and body
(Content-Length or chunked). Returns `{:ok, Request}` or `{:error, reason,
message}` with a `Http.ReadErrorReason`: `:malformed` for syntax problems,
`:header_too_large` or `:body_too_large` past the built-in limits (8192-byte
lines, 100 headers, 16 MiB body), `:timed_out` after the stream timeout,
`:closed` for a closed stream, `:connection_reset` when the peer reset the
connection, or `:other` for another read failure. Does not close `stream`.

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
				defer do
					match Net.close(stream) do
						{:ok, _} -> unit
						{:error, _, message} -> IO.report(message)
					end
				end
				match Http.read_request(stream) do
					{:ok, request} -> IO.println(request.method)
					{:error, _, message} -> IO.report(message)
				end
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### Http.read_response

```el
Http.read_response(stream: Net.Stream, method: string) -> {:ok, Http.Response} | {:error, Http.ReadErrorReason, string}
```

Reads one HTTP/1.1 response from `stream`. `method` is the method of the
request it answers: for `"HEAD"` (and for 1xx, 204, and 304 statuses) no body
is read. Returns `{:ok, Response}` or `{:error, reason, message}` with the
same `Http.ReadErrorReason` cases as `read_request`. Does not close `stream`.

```el
match Net.connect("127.0.0.1", 8080, 1000) do
	{:ok, stream} ->
		defer do
			match Net.close(stream) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match IO.write(stream, "GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n") do
			{:ok, _} ->
				match Http.read_response(stream, "GET") do
					{:ok, response} -> IO.println(response.status)
					{:error, _, message} -> IO.report(message)
				end
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

Header names compare with ASCII case folding. Lookup returns the first match;
replacement removes all matches and appends the new pair. Paths split from
queries at the first `?` without percent decoding.

Lines have a maximum of 8192 bytes including terminators, messages have at most
100 headers including trailers, and bodies have at most 16777216 bytes.
Readers accept CRLF or LF, Content-Length, and chunked transfer coding. They
reject conflicting or duplicate framing fields. Requests without framing have
empty bodies; unframed responses read until EOF. HEAD responses and statuses
1xx, 204, and 304 are bodyless. Truncation returns `{:error, :malformed, message}`.

Encoders use CRLF, replace Content-Length with the byte count, and remove
Transfer-Encoding. Request encoding replaces Host. They validate metadata,
reject CR, LF, or NUL injection, and enforce the same size limits.
