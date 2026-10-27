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

```el
@type Error = {:malformed, string} | :header_too_large | :body_too_large |
	{:unsupported_scheme, string} | {:net, Net.Error}
```

`Http.Error` preserves structured network failures.

## Client

```el
Http.request(method: string, url: string, headers: [{string, string}], body: bytes) -> {:ok, Http.Response} | {:error, Http.Error}
Http.get(url: string) -> {:ok, Http.Response} | {:error, Http.Error}
Http.post(url: string, content_type: string, body: bytes) -> {:ok, Http.Response} | {:error, Http.Error}
```

URLs accept HTTP and HTTPS, optional decimal ports, bracketed IPv6 hosts, paths,
and encoded queries. Default ports are 80 and 443. A missing path becomes `/`.
User info, fragments, and empty hosts are rejected. Other schemes return
`{:unsupported_scheme, scheme}`.

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
			{:error, reason} -> IO.report(String.utf8_error_offset(reason))
		end
	{:error, _} -> IO.report("HTTP request failed")
end
```

## Server

```el
Http.serve(listener: Net.Listener, handler: (Http.Request) -> Http.Response) -> {:error, Http.Error}
Http.serve_one(listener: Net.Listener, handler: (Http.Request) -> Http.Response) -> {:ok, unit} | {:error, Http.Error}
Http.response(status: u16, body: string) -> Http.Response
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

```el
Http.header(headers: [{string, string}], name: string) -> Option[string]
Http.put_header(headers: [{string, string}], name: string, value: string) -> [{string, string}]
Http.encode_request(request: Http.Request, host: string) -> {:ok, bytes} | {:error, Http.Error}
Http.encode_response(response: Http.Response) -> {:ok, bytes} | {:error, Http.Error}
Http.read_request(stream: Net.Stream) -> {:ok, Http.Request} | {:error, Http.Error}
Http.read_response(stream: Net.Stream, method: string) -> {:ok, Http.Response} | {:error, Http.Error}
```

Header names compare with ASCII case folding. Lookup returns the first match;
replacement removes all matches and appends the new pair. Paths split from
queries at the first `?` without percent decoding.

Lines have a maximum of 8192 bytes including terminators, messages have at most
100 headers including trailers, and bodies have at most 16777216 bytes.
Readers accept CRLF or LF, Content-Length, and chunked transfer coding. They
reject conflicting or duplicate framing fields. Requests without framing have
empty bodies; unframed responses read until EOF. HEAD responses and statuses
1xx, 204, and 304 are bodyless. Truncation returns `{:malformed, message}`.

Encoders use CRLF, replace Content-Length with the byte count, and remove
Transfer-Encoding. Request encoding replaces Host. They validate metadata,
reject CR, LF, or NUL injection, and enforce the same size limits.
