# IO

`IO` provides console output, standard streams, and generic operations on open
devices. A device can be a file handle, network stream, standard stream, or
user-defined `Reader` or `Writer`.

## Console output

```el
IO.print[A: Show](value: A) -> unit
IO.println[A: Show](value: A) -> unit
IO.report[A: Show](value: A) -> unit
IO.inspect[T: Show](value: T) -> T
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

```el
IO.stdin() -> IO.Stdin
IO.stdout() -> IO.Stdout
IO.stderr() -> IO.Stderr
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

```el
IO.binread[R: Reader](device: R, max_bytes: usize) ->
	{:ok, bytes} | :eof | {:error, Reader.ErrorReason[R], string}
IO.binwrite[W: Writer](device: W, data: bytes) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
IO.flush[W: Writer](device: W) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
IO.read_all[R: Reader](reader: R) ->
	{:ok, bytes} | {:error, Reader.ErrorReason[R], string}
IO.write[W: Writer](device: W, text: string) ->
	{:ok, unit} | {:error, Writer.ErrorReason[W], string}
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
IO.binread_line(source: IO.LineSource) ->
	{:ok, bytes} | :eof | {:error, :closed | :is_directory | :other, string}
IO.read_line(source: IO.LineSource) ->
	{:ok, string} | :eof | {:error, :closed | :is_directory | :invalid_utf8 | :other, string}
IO.gets(message: string) ->
	{:ok, string} | :eof | {:error, :broken_pipe | :out_of_space | :invalid_utf8 | :other, string}
IO.getn(message: string, count: usize) ->
	{:ok, string} | :eof | {:error, :broken_pipe | :out_of_space | :invalid_utf8 | :other, string}
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
