# IO

`IO` provides console output, standard streams, and generic operations on open
devices. A device can be a file handle, network stream, standard stream, or
user-defined `Reader` or `Writer`.

## Console output

### IO.print

```el
IO.print[A: Show](value: A) -> unit
```

Writes the `Show` text of `value` to standard output without a newline.
Returns `unit`. An output failure is unrecoverable.

```el
IO.print("progress: ")
```

### IO.println

```el
IO.println[A: Show](value: A) -> unit
```

Writes the `Show` text of `value` to standard output with one newline.
Returns `unit`. An output failure is unrecoverable.

```el
IO.println("hello") # hello followed by a newline
```

### IO.report

```el
IO.report[A: Show](value: A) -> unit
```

Writes the `Show` text of `value` to standard error with one newline.
Returns `unit`. An output failure is unrecoverable.

```el
IO.report("cannot open input.txt")
```

### IO.inspect

```el
IO.inspect[T: Show](value: T) -> T
```

Prints the `Show` text of `value` and a newline to standard output, then
returns `value` unchanged, so it can sit in the middle of a pipeline.

```el
answer = 42 |> IO.inspect() # prints 42 and returns 42
```

`print` writes to standard output without a newline. `println` appends one
newline, and `report` writes to standard error with one newline. These
functions format through `Show`; an output failure is unrecoverable. `inspect` prints to standard output with a newline and returns
the input value for use in pipelines.

```el
IO.print("progress: ")
IO.println(42)
IO.inspect(["ready", "waiting"]) # ["ready", "waiting"]
```

Top-level strings print without added quotes. Strings nested in tuples,
collections, and derived struct output are quoted and escaped. Collections
print recursively as `{a, b}`, `[a, b]`, `#[a, b]`, `Slice[a, b]`, and
`%{key => value}`. Maps keep insertion order. These are diagnostic forms with
no stable serialization contract.

## Standard streams

### IO.stdin

```el
IO.stdin() -> IO.Stdin
```

Returns the process's standard-input handle, which implements `Reader`. Copies
share one read-ahead buffer. Programs do not close it.

```el
device = IO.stdin()
```

### IO.stdout

```el
IO.stdout() -> IO.Stdout
```

Returns the process's standard-output handle, which implements `Writer`.
Programs do not close it.

```el
device = IO.stdout()
```

### IO.stderr

```el
IO.stderr() -> IO.Stderr
```

Returns the process's standard-error handle, which implements `Writer`.
Programs do not close it.

```el
device = IO.stderr()
```

These process-owned handles are shared by actors. EL programs do not close them. `IO.Stdin` implements `Reader` with
`ErrorReason = :other`. `IO.Stdout` and `IO.Stderr` implement `Writer` with:

```el
@type IO.WriteErrorReason = :broken_pipe | :out_of_space | :other
```

Standard-stream operations run inside runtime critical sections, so an actor
cannot be killed partway through an operation on shared stream state. A kill
waits until the operation leaves that section.

## Generic readers and writers

### IO.binread

```el
IO.binread[R: Reader](device: R, max_bytes: usize) ->
	{:ok, bytes} | :eof | {:error, Reader.ErrorReason[R], string}
```

Reads at most `max_bytes` bytes from the caller-owned `device` at its current
position. `max_bytes` may be zero. Returns `{:ok, bytes}` (at least one byte
unless `max_bytes` is zero), `:eof`, or `{:error, reason, message}` with the
device's own reasons, `Reader.ErrorReason[R]`. May return fewer bytes than
requested. Does not retry a short read or close `device`.

```el
match IO.binread(IO.stdin(), 1024) do
	{:ok, value} -> IO.println(Bytes.byte_size(value))
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.binwrite

```el
IO.binwrite[W: Writer](device: W, data: bytes) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
```

Writes all of `data` to the caller-owned `device`. Returns `{:ok, unit}` or
`{:error, reason, message}` with the device's own reasons,
`Writer.ErrorReason[W]`; an error may follow partial output. Does not flush or
close `device`.

```el
match IO.binwrite(IO.stdout(), String.bytes("hello\n")) do
	{:ok, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.flush

```el
IO.flush[W: Writer](device: W) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
```

Flushes pending output on the caller-owned `device`. Returns `{:ok, unit}` or
`{:error, reason, message}` with the device's own reasons,
`Writer.ErrorReason[W]`. May be a no-op for an unbuffered device. Does not
close `device`.

```el
match IO.flush(IO.stdout()) do
	{:ok, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.read_all

```el
IO.read_all[R: Reader](reader: R) ->
	{:ok, bytes} | {:error, Reader.ErrorReason[R], string}
```

Reads `reader` until end of input in 8192-byte chunks and returns `{:ok,
all_bytes}`, or the first read failure as `{:error, reason, message}` with the
reader's own reasons, `Reader.ErrorReason[R]`. Does not close `reader`.

```el
match IO.read_all(IO.stdin()) do
	{:ok, data} -> IO.println(Bytes.byte_size(data))
	{:error, _, message} -> IO.report(message)
end
```

### IO.write

```el
IO.write[W: Writer](device: W, text: string) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
```

Writes `text` to the caller-owned `device` as UTF-8. Returns `{:ok, unit}` or
`{:error, reason, message}` with the device's own reasons,
`Writer.ErrorReason[W]`. Does not flush. Renamed from `IO.write_string`.

```el
match IO.write(IO.stdout(), "hello\n") do
	{:ok, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```

`binread` delegates once to `Reader.read` and returns at most `max_bytes`.
A zero-byte request returns empty bytes, including at EOF. Other successful
reads contain at least one byte and may be shorter than requested.

`binwrite` delegates once to `Writer.write`, which writes all bytes or returns
an error. `flush` delegates once to `Writer.flush`. `read_all` reads until EOF;
`write` encodes UTF-8 and writes all bytes. All preserve the implementation's
reason and message, including user-defined implementations.

```el
match IO.write(IO.stdout(), "hello\n") do
	{:ok, _} -> unit
	{:error, :broken_pipe, _} -> unit
	{:error, _, message} -> IO.report(message)
end
```

## Buffered input

```el
@type IO.LineSource = IO.Stdin | File.Reader
```

### IO.binread_line

```el
IO.binread_line(source: IO.LineSource) ->
	{:ok, bytes} | :eof | {:error, :closed | :is_directory | :other, string}
```

Reads one line as raw bytes from `source` (`IO.Stdin` or `File.Reader`),
including the trailing `\n`; a last line without one is returned as is.
Returns `{:ok, bytes}`, `:eof` when no data remains, or `{:error, reason,
message}` with the source's `Reader.read` reasons: `:other` for `IO.Stdin`,
and `:closed`, `:is_directory`, or `:other` for `File.Reader`. Line reads and
`Reader.read` on the same source share one buffer.

```el
match IO.binread_line(IO.stdin()) do
	{:ok, value} -> IO.println(Bytes.byte_size(value))
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.read_line

```el
IO.read_line(source: IO.LineSource) ->
	{:ok, string} | :eof | {:error, :closed | :is_directory | :invalid_utf8 | :other, string}
```

Reads one line from `source` (`IO.Stdin` or `File.Reader`) and decodes it as
UTF-8. The returned text includes the trailing `\n` when present. Returns
`{:ok, string}`, `:eof` when no data remains, or `{:error, reason, message}`
with the `IO.binread_line` reasons, or `:invalid_utf8` if the line is not
valid UTF-8 (the line is still consumed).

```el
match IO.read_line(IO.stdin()) do
	{:ok, value} -> IO.print(value)
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.gets

```el
IO.gets(message: string) ->
	{:ok, string} | :eof | {:error, :broken_pipe | :out_of_space | :invalid_utf8 | :other, string}
```

Prints `message` to standard output, flushes it, then reads one line from
standard input as UTF-8 (the trailing `\n` is included). Returns `{:ok,
string}`, `:eof` at end of input, or `{:error, reason, message}`: an
`IO.WriteErrorReason` if the prompt fails, `:other` if the read fails, or
`:invalid_utf8` for invalid UTF-8.

```el
match IO.gets("Name: ") do
	{:ok, value} -> IO.print(value)
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```

### IO.getn

```el
IO.getn(message: string, count: usize) ->
	{:ok, string} | :eof | {:error, :broken_pipe | :out_of_space | :invalid_utf8 | :other, string}
```

Prints `message` to standard output, flushes it, then reads `count` Unicode
codepoints from standard input (fewer if input ends first). Returns `{:ok,
string}`, `:eof` when no byte was available (and `count > 0`), or `{:error,
reason, message}` with the `IO.gets` reasons: an `IO.WriteErrorReason` if the
prompt fails, `:other` if a read fails, or `:invalid_utf8` if the bytes read
are not valid UTF-8.

```el
match IO.getn("Continue? ", 1) do
	{:ok, value} -> IO.print(value)
	:eof -> unit
	{:error, _, message} -> IO.report(message)
end
```

`binread_line` narrows its reasons to the static source type: `:other` for
`IO.Stdin`, or `File.StreamReadErrorReason` for `File.Reader`. Line reads
include the trailing newline and return an unterminated final line before
`:eof`. Text functions validate UTF-8 and consume an invalid line before
returning `{:error, :invalid_utf8, message}`. The message includes a byte offset
relative to that line.

`gets` writes and flushes a prompt before reading a line from standard input.
`getn` prompts and reads up to `count` Unicode scalar values, rather than bytes
or grapheme clusters. Prompt failures use `IO.WriteErrorReason`.

Standard input and file readers share an 8192-byte read-ahead buffer between
line reads, `IO.binread`, and `IO.read_all`. Copies share buffer state. The
line functions accept only `IO.LineSource`; network lines use
[Net.binread_line](/std/net#stream-i-o-and-cleanup).

Terminal escape strings live in [ANSI](/std/ansi).
