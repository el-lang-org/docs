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

```el
File.open_read(path: string) -> {:ok, File.Reader} | {:error, File.ReadErrorReason, string}
File.create(path: string) -> {:ok, File.Writer} | {:error, File.WriteErrorReason, string}
File.append(path: string) -> {:ok, File.Writer} | {:error, File.WriteErrorReason, string}
File.close(stream: File.Stream) -> {:ok, unit} | {:error, :other, string}
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

```el
File.read(path: string) -> {:ok, bytes} | {:error, File.ReadErrorReason, string}
File.read_text(path: string) -> {:ok, string} | {:error, File.ReadErrorReason | :invalid_utf8, string}
File.write(path: string, data: bytes) -> {:ok, unit} | {:error, File.WriteErrorReason, string}
File.write_text(path: string, text: string) -> {:ok, unit} | {:error, File.WriteErrorReason, string}
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
