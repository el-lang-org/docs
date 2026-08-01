# IO

Console convenience functions, process-owned streams, and error accessors.

## Functions

### IO.print

```el
IO.print(value: a) -> unit when a: Show
```

Writes to standard output without a newline. Accepts any value implementing
`Show`; failure is unrecoverable:

```el
IO.print("progress: ")
```

### IO.println

```el
IO.println(value: a) -> unit when a: Show
```

Writes to standard output with one newline:

```el
IO.println("Hello, world!")
```

### IO.report

```el
IO.report(value: a) -> unit when a: Show
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
IO.error_code(error: IO.Error) -> Option(i64)
```

Returns an optional target-dependent `i64` error code.

## Notes

`IO.print`, `IO.println`, and `IO.report` format through `Show`; this is not a
general implicit conversion to `string`. Programs needing recoverable behavior
use the `Reader` and `Writer` protocols with `IO.stdin`, `IO.stdout`, or
`IO.stderr`. These process-owned handles are not closed by EL programs. Their
associated error type is `IO.Error`; standard I/O, file, and UTF-8 errors are
immutable values implementing `Eq`, `Hash`, and `Show`, but not `Ord`.
