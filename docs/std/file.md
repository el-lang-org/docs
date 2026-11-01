# File

`File` opens and closes file handles and reads or writes whole files by path.
Use [IO](/std/io#generic-readers-and-writers) to read or write an open handle.

## Failure reasons

```el
@type File.ReadErrorReason = :not_found | :permission_denied | :is_directory | :other
@type File.WriteErrorReason =
	:not_found | :permission_denied | :is_directory | :out_of_space | :other
@type File.StreamReadErrorReason = :closed | :is_directory | :other
@type File.StreamWriteErrorReason = :closed | :out_of_space | :other
```

Failures return `{:error, reason, message}`. Match the reason for control flow
and report the message to a person. Messages include operation and available OS
details, with the path for path-based operations. Their wording can change.

## Open and close handles

### File.open_read

```el
File.open_read(path: string) -> {:ok, File.Reader} | {:error, File.ReadErrorReason, string}
```

Opens the file at `path` for reading. Returns `{:ok, reader}` or `{:error,
reason, message}`. `reason` is `:not_found` when `path` does not exist,
`:permission_denied` when the process may not read it, `:is_directory` when it
names a directory, and `:other` for every other failure, including a `path`
that contains a NUL character. The message names the operation, the path, and
the OS description: `"open data.txt: no such file or directory"`. Read the
file with `IO.binread` or the other `IO` helpers, and release it with
`File.close`.

```el
match File.open_read("input.txt") do
	{:ok, file} ->
		defer do
			match File.close(file) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match IO.read_all(file) do
			{:ok, data} -> IO.println(Bytes.byte_size(data))
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### File.create

```el
File.create(path: string) -> {:ok, File.Writer} | {:error, File.WriteErrorReason, string}
```

Opens `path` for writing, creating the file or truncating it if it exists.
Returns `{:ok, writer}` or `{:error, reason, message}`. `reason` is
`:not_found` when the parent directory does not exist, `:permission_denied`
when the process may not write there, `:is_directory` when `path` names a
directory, `:out_of_space` when the device is full, and `:other` for every
other failure. Write with `IO.binwrite` and release with `File.close`.

```el
match File.create("output.txt") do
	{:ok, file} ->
		defer do
			match File.close(file) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match IO.write(file, "hello\n") do
			{:ok, _} -> unit
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### File.append

```el
File.append(path: string) -> {:ok, File.Writer} | {:error, File.WriteErrorReason, string}
```

Opens `path` for writing at the end, creating the file if absent. Returns
`{:ok, writer}` or `{:error, reason, message}` with the `File.create` reasons.
Release with `File.close`.

```el
match File.append("output.txt") do
	{:ok, file} ->
		defer do
			match File.close(file) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match IO.write(file, "hello\n") do
			{:ok, _} -> unit
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

### File.close

```el
File.close(stream: File.Stream) -> {:ok, unit} | {:error, :other, string}
```

Closes a `File.Reader` or `File.Writer` and frees its buffers. Returns `{:ok,
unit}`, or `{:error, :other, message}` if the stream was already closed or the
host close fails. A failed close of a writer can mean that written data was
lost, so report the message. Every copy of the handle becomes invalid.

```el
match File.open_read("input.txt") do
	{:ok, file} ->
		match File.close(file) do
			{:ok, _} -> IO.println("closed")
			{:error, _, message} -> IO.report(message)
		end
	{:error, _, message} -> IO.report(message)
end
```

`open_read` opens an existing file. `create` creates or truncates a file.
`append` creates a missing file or writes at the end of an existing file.
`File.Stream` is `File.Reader | File.Writer`.

`File.Reader` implements `Reader` with `ErrorReason = File.StreamReadErrorReason`.
`File.Writer` implements `Writer` with `ErrorReason = File.StreamWriteErrorReason`.
Copies alias the same descriptor and buffer state. Closing through one alias
invalidates every alias. Later stream operations return `:closed`; a repeated
`File.close` returns `:other` with a closed-stream message.

```el
match File.open_read("input.txt") do
	{:ok, file} ->
		defer do
			match File.close(file) do
				{:ok, _} -> unit
				{:error, _, message} -> IO.report(message)
			end
		end
		match IO.read_all(file) do
			{:ok, data} -> IO.println(Bytes.byte_size(data))
			{:error, _, message} -> IO.report(message)
		end
	{:error, :not_found, _} -> IO.report("file not found")
	{:error, _, message} -> IO.report(message)
end
```

Handles belong to the actor that opened them and cannot be sent to another
actor. Normal scope cleanup uses `defer`. The runtime also closes an actor's
owned resources when that actor ends. Garbage collection alone does not close
an open handle.

There is no combined reader and writer handle, seeking, permission API, or text
mode. Text encoding is explicit.

## Whole-file helpers

### File.read

```el
File.read(path: string) -> {:ok, bytes} | {:error, File.ReadErrorReason, string}
```

Reads the whole file at `path`, opening and closing it for you. Returns `{:ok,
bytes}` or the first failure from open, read, or close as `{:error, reason,
message}`, with the `File.open_read` reasons. A read or close failure gives
`:other`. Renamed from `File.read_bytes`.

```el
match File.read("input.txt") do
	{:ok, value} -> IO.println(Bytes.byte_size(value))
	{:error, :not_found, _} -> IO.report("file not found")
	{:error, _, message} -> IO.report(message)
end
```

### File.read_text

```el
File.read_text(path: string) -> {:ok, string} | {:error, File.ReadErrorReason | :invalid_utf8, string}
```

Reads the whole file at `path` as a string. Returns `{:ok, string}` or
`{:error, reason, message}`. `reason` is one of the `File.read` reasons, or
`:invalid_utf8` when the contents are not valid UTF-8; that message names the
path and the byte offset: `"read data.txt: invalid UTF-8 at byte 12"`.

```el
match File.read_text("input.txt") do
	{:ok, value} -> IO.println(value)
	{:error, :not_found, _} -> IO.report("file not found")
	{:error, _, message} -> IO.report(message)
end
```

### File.write

```el
File.write(path: string, data: bytes) -> {:ok, unit} | {:error, File.WriteErrorReason, string}
```

Writes `data` to `path`, creating the file or truncating it, then flushes and
closes it. Returns `{:ok, unit}` or the first failure as `{:error, reason,
message}`, with the `File.create` reasons. A write that runs out of space
gives `:out_of_space`. Renamed from `File.write_bytes`.

```el
match File.write("output.txt", String.bytes("hello\n")) do
	{:ok, _} -> IO.println("written")
	{:error, _, message} -> IO.report(message)
end
```

### File.write_text

```el
File.write_text(path: string, text: string) -> {:ok, unit} | {:error, File.WriteErrorReason, string}
```

Writes `text` as UTF-8 to `path` like `File.write`: creates or truncates the
file. Returns `{:ok, unit}` or `{:error, reason, message}` with the
`File.write` reasons.

```el
match File.write_text("output.txt", "hello\n") do
	{:ok, _} -> IO.println("written")
	{:error, _, message} -> IO.report(message)
end
```

These helpers open and close their own handles. Writes create or truncate the
file. `read_text` validates UTF-8 and adds `:invalid_utf8` to the read reasons.
`write_text` writes UTF-8 bytes. A close error is returned if the main operation
succeeds.

```el
match File.read_text("input.txt") do
	{:ok, text} ->
		match File.write_text("output.txt", String.downcase(text)) do
			{:ok, _} -> IO.println("written")
			{:error, _, message} -> IO.report(message)
		end
	{:error, :invalid_utf8, message} -> IO.report(message)
	{:error, _, message} -> IO.report(message)
end
```

`File.Reader` has a shared 8192-byte read-ahead buffer. Use
[IO.read_line](/std/io#buffered-input) or `IO.binread_line` to read lines.
