# ANSI

`ANSI` returns terminal escape sequences as strings. It does not write output
or detect terminal support. Its prelude root is `ANSI`, not `IO.ANSI`.

## Functions

```el
ANSI.reset() -> string
ANSI.bright() -> string
ANSI.dim() -> string
ANSI.black() -> string
ANSI.red() -> string
ANSI.green() -> string
ANSI.yellow() -> string
ANSI.blue() -> string
ANSI.magenta() -> string
ANSI.cyan() -> string
ANSI.white() -> string
```

`reset` clears attributes. `bright` and `dim` set intensity; color functions set
the foreground. Reset after styled output:

```el
IO.println("#{ANSI.green()}ready#{ANSI.reset()}")
```
