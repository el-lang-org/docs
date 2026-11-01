# Format

Text layout uses ordinary library functions. Interpolation keeps
`#{expression}` syntax without format specifiers.

## Padding

### Format.pad_left

```el
Format.pad_left(text: string, width: usize, fill: string) -> string
```

Prepends `fill` once for each grapheme missing from the requested `width`.
Text already at least that wide, or an empty `fill`, is unchanged. Width counts
grapheme clusters rather than terminal columns. A fill containing several
graphemes can make the result wider than `width`.

```el
text = Format.pad_left("42", 5, "0") # "00042"
```

### Format.pad_right

```el
Format.pad_right(text: string, width: usize, fill: string) -> string
```

Appends `fill` once for each grapheme missing from the requested `width`.
`width` counts grapheme clusters in `text`, not terminal columns. Text already
at least that wide, or an empty `fill`, is unchanged. A fill containing several
graphemes can make the result wider than `width`.

```el
text = Format.pad_right("EL", 4, " ") # "EL  "
```

Width uses grapheme clusters, as `String.length` does, rather than terminal
columns. Padding repeats the fill on the requested side. Text already at least
that wide, or an empty fill, is returned unchanged. Multi-grapheme fills repeat
whole and can exceed the requested width.

```el
Format.pad_left("42", 5, "0")   # "00042"
Format.pad_right("EL", 4, " ")  # "EL  "
```

## Float text

### Format.float

```el
Format.float(value: f64, precision: usize) -> string
```

Writes `value` in fixed-point notation with exactly `precision` digits after
the decimal point (none, and no point, when `precision` is 0). The scaled
value is computed in `f64` arithmetic and rounded half away from zero, so
`0.5` with precision 0 is "1". Because that multiplication itself rounds, a
value just below a decimal tie can round up: `2.675` with precision 2 is
"2.68" although its binary value is slightly below. Negative values that round
to zero have no sign.

`f64` has no `Show`, so this is also the way to print a float. NaN is "NaN"
and infinities are "inf" and "-inf". A finite value whose magnitude times
10^precision does not fit in `i64` (about 9.2e18) is an unrecoverable failure,
like any out-of-range float-to-integer conversion.

```el
IO.println(Format.float(3.14159, 2)) # 3.14
```

Returns fixed-point notation with exactly `precision` fractional digits.
Rounding is half away from zero on the scaled `f64` value. NaN prints `NaN`;
infinities print `inf` and `-inf`. A finite scaled magnitude outside `i64`
fails through numeric conversion. Large precision can also overflow the
integer scale used by the implementation.

Floats have no `Show` implementation. Use this function to print `f64`, and
convert `f32` explicitly:

```el
IO.println("pi = #{Format.float(Math.pi(), 2)}") # pi = 3.14
```
