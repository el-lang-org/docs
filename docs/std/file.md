# File

Files expose statically separated byte reader and writer handles.

## Functions

### File.open_read

```el
File.open_read(path: string) ->
	{:ok, File.Reader} | {:error, File.Error}
```

Opens `path` for reading. `File.Reader` implements `Reader`:

```el
match File.open_read(path) do
	{:ok, file} -> process(file)
	{:error, reason} -> IO.report(reason)
end
```

### File.create

```el
File.create(path: string) ->
	{:ok, File.Writer} | {:error, File.Error}
```

Creates the file, or truncates it if it already exists. `File.Writer` implements
`Writer`:

```el
match File.create(path) do
	{:ok, file} -> write(file)
	{:error, reason} -> IO.report(reason)
end
```

### File.append

```el
File.append(path: string) ->
	{:ok, File.Writer} | {:error, File.Error}
```

Creates the file if absent and otherwise writes at the end:

```el
match File.append(path) do
	{:ok, file} -> write(file)
	{:error, reason} -> IO.report(reason)
end
```

### File.close

```el
File.close(stream: File.Stream) ->
	{:ok, unit} | {:error, File.Error}
```

Closes a `File.Reader` or `File.Writer`. Closing through one alias invalidates
all aliases; subsequent operations or a repeated close return tagged errors:

```el
defer do
	match File.close(file) do
		{:ok, _} -> unit
		{:error, reason} -> IO.report(reason)
	end
end
```

### File.error_kind

```el
File.error_kind(error: File.Error) -> IO.ErrorKind
```

Returns a stable, portable kind such as `:not_found`. Inspect the kind instead
of parsing `Show` output or a host error code:

```el
match File.error_kind(reason) do
	:not_found -> IO.report("file not found")
	_ -> IO.report(reason)
end
```

### File.error_operation

```el
File.error_operation(error: File.Error) -> IO.Operation
```

Identifies the failed operation.

### File.error_code

```el
File.error_code(error: File.Error) -> Option[i64]
```

Returns an optional target-dependent `i64` error code.

## Notes

`@type File.Stream = File.Reader | File.Writer`. Copying one of these opaque
handles aliases the same OS resource. V1 has no combined read/write handle,
seeking, permission API, or text-mode variants. File errors are immutable values
implementing `Eq`, `Hash`, and `Show`, but not `Ord`.

## Whole-file helpers

```el
File.read_bytes(path: string) -> {:ok, bytes} | {:error, File.Error}
File.read_text(path: string) -> {:ok, string} | {:error, File.Error} | {:error, String.Utf8Error}
File.write_bytes(path: string, data: bytes) -> {:ok, unit} | {:error, File.Error}
File.write_text(path: string, text: string) -> {:ok, unit} | {:error, File.Error}
```

These helpers open and close their own handles. Writes create or truncate the
file. `read_text` validates UTF-8; `write_text` writes UTF-8 bytes. Open and I/O
errors propagate, and a close error is returned if the main operation succeeds.

```el
match File.read_text("input.txt") do
	{:ok, text} ->
		match File.write_text("output.txt", String.downcase(text)) do
			{:ok, _} -> IO.println("written")
			{:error, reason} -> IO.report(reason)
		end
	_ -> IO.report("cannot read UTF-8 input")
end
```

`File.Reader` has a shared 8192-byte read-ahead buffer. Use
[IO.read_line](/std/io#buffered-input) or `IO.binread_line` to read lines.
Whole-file helpers and generic I/O are written in EL over `Reader` and `Writer`.
