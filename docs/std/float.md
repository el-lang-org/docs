# Float

`Float.parse` reads a decimal `f64` prefix from text. The `Float` module
coexists with the numeric protocol of the same name. Existing protocol
operations such as `Float.sqrt` keep their meaning.

## Error reasons

```el
@type ParseErrorReason = :invalid_float | :out_of_range
```

`Float.ParseErrorReason` is the reason type in a parsing error. Messages explain
the failure without copying the input and are not a stable machine format.

## Float.parse

```el
Float.parse(text: string) -> {f64, string} | {:error, Float.ParseErrorReason, string}
```

Reads the longest complete decimal prefix from byte zero and returns the value
and unconsumed text. The input remains unchanged. Integer-looking text is valid.

```el
Float.parse("12.5ms") # {12.5, "ms"}
Float.parse("12")     # {12.0, ""}
Float.parse("1e3s")   # {1000.0, "s"}
Float.parse("1.5e-")  # {1.5, "e-"}
Float.parse("1.")     # {1.0, "."}
```

The syntax is `sign? digits ("." digits)? ([eE] sign? digits)?`, using ASCII
digits and an optional ASCII `+` or `-`. A fraction or exponent is consumed
only when complete. At least one digit must precede a decimal point.
Parsing skips no whitespace and accepts no nonfinite spellings such as `NaN`
or `inf`. Commas, embedded NUL, and Unicode text end a valid prefix and remain
in the returned string.

Returns `:invalid_float` when there are no initial digits, or `:out_of_range`
when the parsed value rounds to infinity. Decimal conversion rounds directly
to binary64 with nearest, ties-to-even, independently of locale and caller
rounding mode. Finite subnormals and underflow to signed zero succeed.
Malformed text returns an error value without terminating the actor.

```el
match Float.parse("12.5ms") do
	{value, rest} -> IO.println("#{Format.float(value, 1)} #{rest}")
	{:error, _, message} -> IO.report(message)
end
# Prints 12.5 ms.
```

[String.to_float](/std/string#string-to-float) requires a decimal point and
complete input, returning `{:ok, value}` on success. [Format.float](/std/format#format-float)
formats a floating-point value for output.
