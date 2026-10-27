# Format

Text layout uses ordinary library functions. Interpolation keeps
`#{expression}` syntax without format specifiers.

## Padding

```el
Format.pad_left(text: string, width: usize, fill: string) -> string
Format.pad_right(text: string, width: usize, fill: string) -> string
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

```el
Format.float(value: f64, precision: usize) -> string
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
