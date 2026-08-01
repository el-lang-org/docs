# Process

Process arguments and environment access.

## Functions

### Process.arguments

```el
Process.arguments() -> {:ok, [string]} | {:error, {:invalid_text, usize}}
```

Returns only the arguments supplied after the executable name, in launch order.
Conversion is all-or-nothing; the `usize` in `{:invalid_text, index}` is the
zero-based index in the returned argument list:

```el
match Process.arguments() do
  {:ok, arguments} -> Enum.each(arguments, IO.println)
  {:error, {:invalid_text, index}} ->
    IO.report("invalid text at " ++ Show.show(index))
end
```

### Process.get_env

```el
Process.get_env(name: string) ->
  {:ok, string} | :not_found | {:error, :invalid_name | :invalid_text}
```

Returns the launch-time value of one environment variable. Returns `:not_found`
when the name was absent; a name containing U+0000 or `=` returns
`{:error, :invalid_name}`:

```el
match Process.get_env("HOME") do
  {:ok, value} -> IO.println(value)
  :not_found -> IO.println("unset")
  {:error, :invalid_name} -> IO.println("invalid name")
end
```

## Notes

The runtime snapshots the arguments and environment before calling `Main.main`,
so repeated calls observe the same values. V1 provides no environment
enumeration, mutation, current-directory mutation, or executable-path API.
