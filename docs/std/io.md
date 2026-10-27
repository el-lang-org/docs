# IO

Console convenience functions, process-owned streams, and error accessors.

## Functions

### IO.print

```el
IO.print[A: Show](value: A) -> unit
```

Writes to standard output without a newline. Accepts any value implementing
`Show`; failure is unrecoverable:

```el
IO.print("progress: ")
```

### IO.println

```el
IO.println[A: Show](value: A) -> unit
```

Writes to standard output with one newline:

```el
IO.println("Hello, world!")
```

### IO.report

```el
IO.report[A: Show](value: A) -> unit
```

Writes to standard error with one newline:

```el
IO.report(reason)
```

### IO.stdin

```el
IO.stdin() -> IO.Stdin
```

Returns the process-owned standard input stream. It implements `Reader`.

### IO.stdout

```el
IO.stdout() -> IO.Stdout
```

Returns the process-owned standard output stream. It implements `Writer`.

### IO.stderr

```el
IO.stderr() -> IO.Stderr
```

Returns the process-owned standard error stream. It implements `Writer`.

### IO.error_kind

```el
IO.error_kind(error: IO.Error) -> IO.ErrorKind
```

Returns the stable, portable error kind.

### IO.error_operation

```el
IO.error_operation(error: IO.Error) -> IO.Operation
```

Identifies the failed operation.

### IO.error_code

```el
IO.error_code(error: IO.Error) -> Option[i64]
```

Returns an optional target-dependent `i64` error code.

## Notes

`IO.print`, `IO.println`, and `IO.report` format through `Show`; this is not a
general implicit conversion to `string`. Collections use recursive diagnostic
formatting: tuples as `{a, b}`, lists as `[a, b]`, arrays as `#[a, b]`, slices
as `Slice[a, b]`, and maps as `%{key => value}` in insertion order. These forms
are for human-readable diagnostics, not parsing or stable serialization.
Programs needing recoverable behavior use the `Reader` and `Writer` protocols
with `IO.stdin`, `IO.stdout`, or `IO.stderr`. These process-owned handles are
not closed by EL programs. Their associated error type is `IO.Error`; standard
I/O, file, and UTF-8 errors are immutable values implementing `Eq`, `Hash`, and
`Show`, but not `Ord`.

## Generic readers and writers

```el
IO.read_all[R: Reader](reader: R) -> {:ok, bytes} | {:error, Reader.Error[R]}
IO.write_string[W: Writer](writer: W, text: string) -> {:ok, unit} | {:error, Writer.Error[W]}
```

`read_all` reads until EOF. `write_string` encodes UTF-8 and writes all bytes.
Both work with user-defined protocol implementations and preserve their
associated error type.

## Inspection

```el
IO.inspect[T: Show](value: T) -> T
```

Prints `Show` text and a newline, then returns the input value. Strings are
printed without added quotes. Returning the value makes inspection useful
inside pipelines.

## Buffered input

```el
IO.binread_line(source: IO.LineSource) -> {:ok, bytes} | :eof | {:error, IO.Error} | {:error, File.Error}
IO.read_line(source: IO.LineSource) -> {:ok, string} | :eof | {:error, IO.Error} | {:error, File.Error} | {:error, String.Utf8Error}
IO.gets(message: string) -> {:ok, string} | :eof | {:error, IO.Error} | {:error, String.Utf8Error}
IO.getn(message: string, count: usize) -> {:ok, string} | :eof | {:error, IO.Error} | {:error, String.Utf8Error}
```

`IO.LineSource` is `IO.Stdin | File.Reader`. Line reads include the trailing
newline and return an unterminated final line before `:eof`. Text functions
validate UTF-8; an invalid line is consumed, and its error offset is relative
to that line.

`gets` writes and flushes a prompt before reading a line from standard input.
`getn` prompts and reads Unicode scalar values, up to `count`, rather than
bytes or grapheme clusters. Prompt failures return `IO.Error`.

Standard input and file readers share an 8192-byte read-ahead buffer between
line reads, `Reader.read`, and `read_all`. Copies share buffer state. Raw reads
may return fewer than the requested bytes after one OS read.

Terminal escape strings live in the separate [ANSI](/std/ansi) prelude root.
