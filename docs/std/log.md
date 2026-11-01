# Log

`Log` writes leveled messages to standard error. `Log.Logger` is a persistent
value with a `name` and threshold `level`. `Log.Level` is
`:debug | :info | :warn | :error`, in increasing severity.

## Functions

### Log.new

```el
Log.new(name: string, level: Log.Level) -> Log.Logger
```

Returns a logger named `name` that emits messages at `level` or above
(`:debug` < `:info` < `:warn` < `:error`). `name` appears in every line.

```el
logger = Log.new("app", :info)
```

### Log.with_level

```el
Log.with_level(logger: Log.Logger, level: Log.Level) -> Log.Logger
```

Returns a copy of `logger` with threshold `level`; the name is kept and
`logger` is unchanged.

```el
logger = Log.new("app", :info)
verbose = Log.with_level(logger, :debug)
```

### Log.enabled

```el
Log.enabled(logger: Log.Logger, level: Log.Level) -> bool
```

Returns true when a message at `level` meets `logger`'s threshold, that is,
when `level` is at or above it.

```el
enabled = Log.enabled(Log.new("app", :info), :debug) # false
```

### Log.format

```el
Log.format(name: string, level: Log.Level, message: string, timestamp: string) -> string
```

Builds, without writing, the line `"<timestamp> [<LEVEL>] <name>: <message>"`.
`level` is shown upper-case (`DEBUG`, `INFO`, `WARN`, `ERROR`); `timestamp` is
used as given.

```el
line = Log.format("app", :info, "started", "2001-09-09T01:46:40Z")
# "2001-09-09T01:46:40Z [INFO] app: started"
```

### Log.log

```el
Log.log[A: Show](logger: Log.Logger, level: Log.Level, message: A) -> unit
```

Writes one line to standard error through `IO.report` when `level` meets
`logger`'s threshold; otherwise does nothing. `message` is any `Show` value,
rendered with interpolation. The timestamp is the current UTC time. Returns
`unit`.

```el
logger = Log.new("app", :info)
Log.log(logger, :warn, "retrying")
```

### Log.debug

```el
Log.debug[A: Show](logger: Log.Logger, message: A) -> unit
```

Writes `message` at level `:debug` through `Log.log` when it meets
`logger`'s threshold. The message must implement `Show`. Output goes to
standard error with the current UTC timestamp and logger name. Returns `unit`.

```el
logger = Log.new("app", :debug)
Log.debug(logger, "message")
```

### Log.info

```el
Log.info[A: Show](logger: Log.Logger, message: A) -> unit
```

Writes `message` at level `:info` through `Log.log` when it meets
`logger`'s threshold. The message must implement `Show`. Output goes to
standard error with the current UTC timestamp and logger name. Returns `unit`.

```el
logger = Log.new("app", :debug)
Log.info(logger, "message")
```

### Log.warn

```el
Log.warn[A: Show](logger: Log.Logger, message: A) -> unit
```

Writes `message` at level `:warn` through `Log.log` when it meets
`logger`'s threshold. The message must implement `Show`. Output goes to
standard error with the current UTC timestamp and logger name. Returns `unit`.

```el
logger = Log.new("app", :debug)
Log.warn(logger, "message")
```

### Log.error

```el
Log.error[A: Show](logger: Log.Logger, message: A) -> unit
```

Writes `message` at level `:error` through `Log.log` when it meets
`logger`'s threshold. The message must implement `Show`. Output goes to
standard error with the current UTC timestamp and logger name. Returns `unit`.

```el
logger = Log.new("app", :debug)
Log.error(logger, "message")
```

Messages below the threshold produce no output. Other messages format through
`Show` and print one line:

```text
2001-09-09T01:46:40Z [INFO] app: started
```

The timestamp comes from `Time.format(Time.now())`. `format` builds a line from
explicit string values without writing it. There are no global loggers or
configurable output sinks.

```el
logger = Log.new("app", :info)
Log.debug(logger, "hidden")
Log.info(logger, "started")
```
