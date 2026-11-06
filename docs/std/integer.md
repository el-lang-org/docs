# Integer

`Integer.parse` reads an `i64` prefix from text. The `Integer` module coexists
with the numeric protocol of the same name. Parsing adds no methods or
requirements to that protocol.

## Error reasons

```el
@type ParseErrorReason = :invalid_base | :invalid_integer | :out_of_range
```

`Integer.ParseErrorReason` is the reason type in a parsing error. Messages
explain the failure without copying the input and are not a stable machine
format.

## Integer.parse

```el
Integer.parse(text: string, base: i64) ->
	{i64, string} | {:error, Integer.ParseErrorReason, string}
```

Reads the longest signed integer prefix from byte zero and returns the value
and unconsumed text. `base` must be an `i64` between 2 and 36 inclusive.
Direct calls may omit it to use base 10, including calls through a pipeline.
The input remains unchanged.

```el
Integer.parse("42kg")       # {42, "kg"}
Integer.parse("-2Akg", 16)  # {-42, "kg"}
Integer.parse("0x10", 16)   # {0, "x10"}
"101rest" |> Integer.parse(2) # {5, "rest"}
```

The syntax is an optional ASCII `+` or `-` followed by at least one digit valid
in the base. ASCII letters in either case represent digits 10 through 35.
Parsing skips no whitespace. Radix prefixes, underscores, and Unicode digits
receive no special treatment. Embedded NUL and non-ASCII text end the prefix
and remain in the returned string.

Failures are checked in this order:

1. `:invalid_base` when the base is outside 2 through 36.
2. `:invalid_integer` when no initial digits follow the optional sign.
3. `:out_of_range` when the complete prefix is outside the `i64` range.

The minimum `i64`, `-9223372036854775808`, is valid. Malformed text returns an
error value without terminating the actor.

```el
match Integer.parse("9223372036854775808kg") do
	{value, rest} -> IO.println("#{value}: #{rest}")
	{:error, :out_of_range, _} -> IO.report("integer is too large")
	{:error, _, message} -> IO.report(message)
end
```

Function values retain two arguments. A decimal-only callback uses a closure:

```el
parse_decimal = fn text: string -> Integer.parse(text) end
result = parse_decimal("42kg") # {42, "kg"}
```

[String.to_integer](/std/string#string-to-integer) requires complete input and
returns `{:ok, value}` on success. [Numeric conversions](/std/numeric) convert
an existing numeric value to another type.
