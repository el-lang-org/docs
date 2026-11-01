# JSON

`JSON.Value` is an opaque parsed document. Values are obtained only through
`decode` and implement none of `Eq`, `Ord`, `Hash`, or `Show`.

## Functions

### JSON.decode

```el
JSON.decode(text: string) -> {:ok, JSON.Value} | {:error, string}
```

Parses one complete JSON document from `text`, returning an opaque
`JSON.Value` or a human-readable error string. The value does not implement
`Eq`, `Ord`, `Hash`, or `Show`.

```el
match JSON.decode("{\"answer\":42}") do
	{:ok, value} -> IO.println("valid JSON")
	{:error, message} -> IO.report(message)
end
```

### JSON.format

```el
JSON.format(value: JSON.Value) -> string
```

Returns `value` as JSON with two-space indentation. Object member order
and number spellings are preserved, and decoded strings are escaped for JSON.

```el
match JSON.decode("{\"answer\":42}") do
	{:ok, value} -> IO.println(JSON.format(value))
	{:error, message} -> IO.report(message)
end
```

### JSON.encode

```el
JSON.encode(value: JSON.Value) -> string
```

Returns `value` as compact JSON. Object member order and number spellings
are preserved, and decoded strings are escaped for JSON.

```el
match JSON.decode("{\"answer\":42}") do
	{:ok, value} -> IO.println(JSON.encode(value))
	{:error, message} -> IO.report(message)
end
```

`decode` consumes one complete JSON document and returns malformed input as an
error string. `format` uses two-space indentation; `encode` emits compact JSON.
The module name is `JSON`; the former `Json` spelling is no longer accepted.

Both preserve object member order and number spellings and escape decoded
strings for JSON output.

```el
match JSON.decode("{\"answer\":42}") do
	{:ok, value} -> IO.println(JSON.encode(value))
	{:error, message} -> IO.report(message)
end
# Prints {"answer":42}
```
