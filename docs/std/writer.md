# Writer

`Writer` is a core byte-output protocol with the associated type `ErrorReason`.
See [Protocols](/getting-started/protocols) for implementation rules.

## Functions

### Writer.write

```el
Writer.write[W: Writer](writer: W, data: bytes) -> {:ok, unit} | {:error, Writer.ErrorReason[W], string}
```

Writes all of `data` to `writer`, or returns the implementation's failure
reason and message. A failure can follow partial output. It does not close or
implicitly flush the writer. Most device calls use `IO.binwrite`.

```el
match Writer.write(IO.stdout(), String.bytes("hello\n")) do
	{:ok, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```

### Writer.flush

```el
Writer.flush[W: Writer](writer: W) -> {:ok, unit} | {:error, Writer.ErrorReason[W], string}
```

Flushes pending output on `writer`, returning success or the
implementation's failure reason and message. An unbuffered implementation can
return success without doing work. It leaves the writer open. Most device
calls use `IO.flush`.

```el
match Writer.flush(IO.stdout()) do
	{:ok, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```
