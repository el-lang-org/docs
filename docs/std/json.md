# JSON

`JSON.Value` is an opaque parsed document. Values are obtained only through
`decode` and implement none of `Eq`, `Ord`, `Hash`, or `Show`.

## Functions

```el
JSON.decode(text: string) -> {:ok, JSON.Value} | {:error, string}
JSON.format(value: JSON.Value) -> string
JSON.encode(value: JSON.Value) -> string
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
