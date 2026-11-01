# Buffer

`Buffer` is a growable standard-library builder for constructing `string` or
`bytes` without repeated immutable concatenation. It is a byte builder with an
explicit value-style API.

## Functions

### Buffer.new

```el
Buffer.new() -> Buffer
```

Creates an empty buffer:

```el
mut buffer = Buffer.new()
```

### Buffer.byte_size

```el
Buffer.byte_size(buffer: Buffer) -> usize
```

Returns the number of bytes currently in the buffer:

```el
size = Buffer.byte_size(buffer)
```

### Buffer.append_byte

```el
Buffer.append_byte(buffer: Buffer, value: u8) -> Buffer
```

Returns a new buffer with one byte appended:

```el
buffer := Buffer.append_byte(buffer, 0x20)
```

### Buffer.append_bytes

```el
Buffer.append_bytes(buffer: Buffer, value: bytes) -> Buffer
```

Returns a new buffer with the raw bytes appended:

```el
buffer := Buffer.append_bytes(buffer, data)
```

### Buffer.append_string

```el
Buffer.append_string(buffer: Buffer, value: string) -> Buffer
```

Returns a new buffer with the string's UTF-8 bytes appended:

```el
buffer := Buffer.append_string(buffer, "hello")
```

### Buffer.to_bytes

```el
Buffer.to_bytes(buffer: Buffer) -> bytes
```

Returns the current contents as `bytes`. It always succeeds:

```el
data = Buffer.to_bytes(buffer)
```

### Buffer.to_string

```el
Buffer.to_string(buffer: Buffer) ->
	{:ok, string} | {:error, :invalid_utf8, string}
```

Returns the current contents as a UTF-8 `string`. It validates the complete
byte sequence. A failure message includes the zero-based byte offset of the
first invalid sequence:

```el
match Buffer.to_string(buffer) do
	{:ok, text} -> IO.println(text)
	{:error, :invalid_utf8, message} -> IO.report(message)
end
```

## Notes

There is no overloaded `append`; distinct `append_byte`, `append_bytes`, and
`append_string` functions keep the argument types explicit. Values returned by
either conversion never change after later buffer operations. Appending to the
latest buffer value reuses spare capacity with amortized O(1) cost per byte.
Appending to an older value copies its existing bytes first. Snapshot contents
remain immutable, including when actors append to the same buffer value.
