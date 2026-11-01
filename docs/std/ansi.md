# ANSI

`ANSI` returns terminal escape sequences as strings. It does not write output
or detect terminal support. Its prelude root is `ANSI`, not `IO.ANSI`.

## Functions

### ANSI.reset

```el
ANSI.reset() -> string
```

Returns the escape sequence that clears all colors and styles (`ESC[0m`).
Append it after styled text: `"#{ANSI.red()}x#{ANSI.reset()}"`.

```el
IO.println("#{ANSI.reset()}ready#{ANSI.reset()}")
```

### ANSI.bright

```el
ANSI.bright() -> string
```

Returns the escape sequence for bold/bright text (`ESC[1m`). Undo with
`reset`.

```el
IO.println("#{ANSI.bright()}bright#{ANSI.reset()}")
```

### ANSI.dim

```el
ANSI.dim() -> string
```

Returns the escape sequence for dim text (`ESC[2m`). Undo with `reset`.

```el
IO.println("#{ANSI.dim()}dim#{ANSI.reset()}")
```

### ANSI.black

```el
ANSI.black() -> string
```

Returns the escape sequence selecting black foreground (`ESC[30m`).

```el
IO.println("#{ANSI.black()}black#{ANSI.reset()}")
```

### ANSI.red

```el
ANSI.red() -> string
```

Returns the escape sequence selecting red foreground (`ESC[31m`).

```el
IO.println("#{ANSI.red()}red#{ANSI.reset()}")
```

### ANSI.green

```el
ANSI.green() -> string
```

Returns the escape sequence selecting green foreground (`ESC[32m`).

```el
IO.println("#{ANSI.green()}green#{ANSI.reset()}")
```

### ANSI.yellow

```el
ANSI.yellow() -> string
```

Returns the escape sequence selecting yellow foreground (`ESC[33m`).

```el
IO.println("#{ANSI.yellow()}yellow#{ANSI.reset()}")
```

### ANSI.blue

```el
ANSI.blue() -> string
```

Returns the escape sequence selecting blue foreground (`ESC[34m`).

```el
IO.println("#{ANSI.blue()}blue#{ANSI.reset()}")
```

### ANSI.magenta

```el
ANSI.magenta() -> string
```

Returns the escape sequence selecting magenta foreground (`ESC[35m`).

```el
IO.println("#{ANSI.magenta()}magenta#{ANSI.reset()}")
```

### ANSI.cyan

```el
ANSI.cyan() -> string
```

Returns the escape sequence selecting cyan foreground (`ESC[36m`).

```el
IO.println("#{ANSI.cyan()}cyan#{ANSI.reset()}")
```

### ANSI.white

```el
ANSI.white() -> string
```

Returns the escape sequence selecting white foreground (`ESC[37m`).

```el
IO.println("#{ANSI.white()}white#{ANSI.reset()}")
```

`reset` clears attributes. `bright` and `dim` set intensity; color functions set
the foreground. Reset after styled output:

```el
IO.println("#{ANSI.green()}ready#{ANSI.reset()}")
```
