# Numeric conversions

The numeric types `I8 I16 I32 I64 Isize U8 U16 U32 U64 Usize` are prelude root
modules. Each names an explicit conversion function used to convert between
numeric types; there is no implicit numeric conversion:

```el
narrow: i32 = i32(wide)
wide: f64 = f64(narrow)
```

The conversion modules are:

```text
I8 I16 I32 I64 Isize
U8 U16 U32 U64 Usize
```

plus the floating-point conversions `f32` and `f64`.

## Semantics

- Integer-to-integer conversion checks the destination range.
- Float-to-integer conversion truncates toward zero and rejects NaN, infinity,
  and out-of-range results.
- Integer-to-float conversion permits explicit precision loss.
- `rune`-to-`u32` is lossless; integer-to-`rune` conversion rejects values that
  are not Unicode scalar values.
- A statically known invalid conversion is a compile-time error; otherwise it is
  a runtime failure.
