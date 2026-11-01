# Reader

`Reader` is a core protocol with static dispatch. See [Protocols](/getting-started/protocols)
for declarations and implementation rules.

## Functions

### Reader.read

```el
Reader.read[R: Reader](reader: R, max_bytes: usize) -> {:ok, bytes} | :eof | {:error, Reader.ErrorReason[R], string}
```

Reads at most `max_bytes` from `reader`, returning bytes, `:eof`, or the
implementation's failure reason and message. A successful nonzero request
contains at least one byte. A zero-byte request returns empty bytes, including
at EOF. It leaves the reader open. Most device calls use `IO.binread`.

```el
match Reader.read(IO.stdin(), 1024) do
	{:ok, data} -> IO.println(Bytes.byte_size(data))
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```
