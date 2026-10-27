# Json

`Json.Value` is an opaque parsed document. Values are obtained only through
`decode` and implement none of `Eq`, `Ord`, `Hash`, or `Show`.

## Functions

```el
Json.decode(text: string) -> {:ok, Json.Value} | {:error, string}
Json.format(value: Json.Value) -> string
Json.encode(value: Json.Value) -> string
```

`decode` consumes one complete JSON document and returns malformed input as an
error string. `format` uses two-space indentation; `encode` emits compact JSON.
Both preserve object member order and number spellings and escape decoded
strings for JSON output.

```el
match Json.decode("{\"answer\":42}") do
	{:ok, value} -> IO.println(Json.encode(value))
	{:error, message} -> IO.report(message)
end
# Prints {"answer":42}
```
