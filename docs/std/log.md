# Log

`Log` writes leveled messages to standard error. `Log.Logger` is a persistent
value with a `name` and threshold `level`. `Log.Level` is
`:debug | :info | :warn | :error`, in increasing severity.

## Functions

```el
Log.new(name: string, level: Log.Level) -> Log.Logger
Log.with_level(logger: Log.Logger, level: Log.Level) -> Log.Logger
Log.enabled(logger: Log.Logger, level: Log.Level) -> bool
Log.format(name: string, level: Log.Level, message: string, timestamp: string) -> string
Log.log[A: Show](logger: Log.Logger, level: Log.Level, message: A) -> unit
Log.debug[A: Show](logger: Log.Logger, message: A) -> unit
Log.info[A: Show](logger: Log.Logger, message: A) -> unit
Log.warn[A: Show](logger: Log.Logger, message: A) -> unit
Log.error[A: Show](logger: Log.Logger, message: A) -> unit
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
