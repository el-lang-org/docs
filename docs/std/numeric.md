# Numeric conversions and wrapping arithmetic

Numeric conversions use lowercase type names. The integer modules provide
explicit wrapping arithmetic with no implicit numeric conversion:

```el
wide: i64 = 100
narrow: i32 = i32(wide)
floating: f64 = f64(narrow)
```

The integer modules are:

```text
I8 I16 I32 I64 Isize
U8 U16 U32 U64 Usize
```

`f32`, `f64`, and `rune` are conversion forms without wrapping-operation modules.

Text parsing uses [Integer.parse](/std/integer), [Float.parse](/std/float),
[String.to_integer](/std/string#string-to-integer), or
[String.to_float](/std/string#string-to-float). These functions return recoverable
errors for malformed text. Numeric conversion forms do not parse strings.

## Semantics

- Integer-to-integer conversion checks the destination range.
- Float-to-integer conversion truncates toward zero and rejects NaN, infinity,
  and out-of-range results.
- Integer-to-float conversion permits explicit precision loss.
- `rune`-to-`u32` is lossless; integer-to-`rune` conversion rejects values that
  are not Unicode scalar values.
- A statically known invalid conversion is a compile-time error; otherwise it is
  a runtime failure.

## Conversion functions

The signature notation `value` accepts the source types described in each entry.
Conversion syntax does not call a method on the PascalCase integer module.

### i8

```el
i8(value) -> i8
```

Converts a numeric `value` to `i8` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = i8(42.9) # 42
```

### i16

```el
i16(value) -> i16
```

Converts a numeric `value` to `i16` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = i16(42.9) # 42
```

### i32

```el
i32(value) -> i32
```

Converts a numeric `value` to `i32` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = i32(42.9) # 42
```

### i64

```el
i64(value) -> i64
```

Converts a numeric `value` to `i64` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = i64(42.9) # 42
```

### isize

```el
isize(value) -> isize
```

Converts a numeric `value` to `isize` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.
The destination width matches the compilation target.

```el
value = isize(42.9) # 42
```

### u8

```el
u8(value) -> u8
```

Converts a numeric `value` to `u8` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = u8(42.9) # 42
```

### u16

```el
u16(value) -> u16
```

Converts a numeric `value` to `u16` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = u16(42.9) # 42
```

### u32

```el
u32(value) -> u32
```

Converts a numeric `value` to `u32` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.
A `rune` also converts losslessly to `u32`.

```el
value = u32(42.9) # 42
```

### u64

```el
u64(value) -> u64
```

Converts a numeric `value` to `u64` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.

```el
value = u64(42.9) # 42
```

### usize

```el
usize(value) -> usize
```

Converts a numeric `value` to `usize` with a destination-range check.
A floating-point value is truncated toward zero; NaN, infinity, and an
out-of-range result fail with `invalid_conversion`. A known invalid conversion
is rejected at compile time.
The destination width matches the compilation target.

```el
value = usize(42.9) # 42
```

### f32

```el
f32(value) -> f32
```

Converts an integer or floating-point `value` to `f32`. Integer
precision can be lost. Conversion to `f32` uses IEEE rounding and can produce
infinity when the finite source is too large. No implicit conversion occurs.

```el
value = f32(42) # 42.0
```

### f64

```el
f64(value) -> f64
```

Converts an integer or floating-point `value` to `f64`. Integer
precision can be lost. Conversion to `f32` uses IEEE rounding and can produce
infinity when the finite source is too large. No implicit conversion occurs.

```el
value = f64(42) # 42.0
```

### rune

```el
rune(value) -> rune
```

Converts an integer Unicode code point to `rune`. Surrogates, negative
values, and values above U+10FFFF fail with `invalid_conversion`. A known
invalid literal is rejected at compile time.

```el
value = rune(955) # 'λ'
```

## I8 wrapping functions

### I8.wrapping_add

```el
I8.wrapping_add(left: i8, right: i8) -> i8
```

Returns `left + right` modulo the width of `i8`. Overflow wraps
instead of failing, and both operands must have type `i8`.

```el
left: i8 = 127
value = I8.wrapping_add(left, 1) # -128
```

### I8.wrapping_sub

```el
I8.wrapping_sub(left: i8, right: i8) -> i8
```

Returns `left - right` modulo the width of `i8`. Underflow wraps
instead of failing, and both operands must have type `i8`.

```el
left: i8 = -128
value = I8.wrapping_sub(left, 1) # 127
```

### I8.wrapping_mul

```el
I8.wrapping_mul(left: i8, right: i8) -> i8
```

Returns `left * right` modulo the width of `i8`. Overflow wraps
instead of failing, and both operands must have type `i8`.

```el
left: i8 = 127
value = I8.wrapping_mul(left, 2) # -2
```

### I8.wrapping_neg

```el
I8.wrapping_neg(value: i8) -> i8
```

Returns `0 - value` modulo the width of `i8`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: i8 = 1
value = I8.wrapping_neg(input) # -1
```

### I8.wrapping_shl

```el
I8.wrapping_shl(value: i8, count: usize) -> i8
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`i8`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: i8 = 1
value = I8.wrapping_shl(input, 8) # 1
```

### I8.wrapping_shr

```el
I8.wrapping_shr(value: i8, count: usize) -> i8
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`i8`. The shift preserves the sign bit.
The count has type `usize`.

```el
input: i8 = -2
value = I8.wrapping_shr(input, 1) # -1
```

## I16 wrapping functions

### I16.wrapping_add

```el
I16.wrapping_add(left: i16, right: i16) -> i16
```

Returns `left + right` modulo the width of `i16`. Overflow wraps
instead of failing, and both operands must have type `i16`.

```el
left: i16 = 32767
value = I16.wrapping_add(left, 1) # -32768
```

### I16.wrapping_sub

```el
I16.wrapping_sub(left: i16, right: i16) -> i16
```

Returns `left - right` modulo the width of `i16`. Underflow wraps
instead of failing, and both operands must have type `i16`.

```el
left: i16 = -32768
value = I16.wrapping_sub(left, 1) # 32767
```

### I16.wrapping_mul

```el
I16.wrapping_mul(left: i16, right: i16) -> i16
```

Returns `left * right` modulo the width of `i16`. Overflow wraps
instead of failing, and both operands must have type `i16`.

```el
left: i16 = 32767
value = I16.wrapping_mul(left, 2) # -2
```

### I16.wrapping_neg

```el
I16.wrapping_neg(value: i16) -> i16
```

Returns `0 - value` modulo the width of `i16`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: i16 = 1
value = I16.wrapping_neg(input) # -1
```

### I16.wrapping_shl

```el
I16.wrapping_shl(value: i16, count: usize) -> i16
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`i16`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: i16 = 1
value = I16.wrapping_shl(input, 16) # 1
```

### I16.wrapping_shr

```el
I16.wrapping_shr(value: i16, count: usize) -> i16
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`i16`. The shift preserves the sign bit.
The count has type `usize`.

```el
input: i16 = -2
value = I16.wrapping_shr(input, 1) # -1
```

## I32 wrapping functions

### I32.wrapping_add

```el
I32.wrapping_add(left: i32, right: i32) -> i32
```

Returns `left + right` modulo the width of `i32`. Overflow wraps
instead of failing, and both operands must have type `i32`.

```el
left: i32 = 2147483647
value = I32.wrapping_add(left, 1) # -2147483648
```

### I32.wrapping_sub

```el
I32.wrapping_sub(left: i32, right: i32) -> i32
```

Returns `left - right` modulo the width of `i32`. Underflow wraps
instead of failing, and both operands must have type `i32`.

```el
left: i32 = -2147483648
value = I32.wrapping_sub(left, 1) # 2147483647
```

### I32.wrapping_mul

```el
I32.wrapping_mul(left: i32, right: i32) -> i32
```

Returns `left * right` modulo the width of `i32`. Overflow wraps
instead of failing, and both operands must have type `i32`.

```el
left: i32 = 2147483647
value = I32.wrapping_mul(left, 2) # -2
```

### I32.wrapping_neg

```el
I32.wrapping_neg(value: i32) -> i32
```

Returns `0 - value` modulo the width of `i32`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: i32 = 1
value = I32.wrapping_neg(input) # -1
```

### I32.wrapping_shl

```el
I32.wrapping_shl(value: i32, count: usize) -> i32
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`i32`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: i32 = 1
value = I32.wrapping_shl(input, 32) # 1
```

### I32.wrapping_shr

```el
I32.wrapping_shr(value: i32, count: usize) -> i32
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`i32`. The shift preserves the sign bit.
The count has type `usize`.

```el
input: i32 = -2
value = I32.wrapping_shr(input, 1) # -1
```

## I64 wrapping functions

### I64.wrapping_add

```el
I64.wrapping_add(left: i64, right: i64) -> i64
```

Returns `left + right` modulo the width of `i64`. Overflow wraps
instead of failing, and both operands must have type `i64`.

```el
left: i64 = 9223372036854775807
value = I64.wrapping_add(left, 1) # -9223372036854775808
```

### I64.wrapping_sub

```el
I64.wrapping_sub(left: i64, right: i64) -> i64
```

Returns `left - right` modulo the width of `i64`. Underflow wraps
instead of failing, and both operands must have type `i64`.

```el
left: i64 = -9223372036854775808
value = I64.wrapping_sub(left, 1) # 9223372036854775807
```

### I64.wrapping_mul

```el
I64.wrapping_mul(left: i64, right: i64) -> i64
```

Returns `left * right` modulo the width of `i64`. Overflow wraps
instead of failing, and both operands must have type `i64`.

```el
left: i64 = 9223372036854775807
value = I64.wrapping_mul(left, 2) # -2
```

### I64.wrapping_neg

```el
I64.wrapping_neg(value: i64) -> i64
```

Returns `0 - value` modulo the width of `i64`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: i64 = 1
value = I64.wrapping_neg(input) # -1
```

### I64.wrapping_shl

```el
I64.wrapping_shl(value: i64, count: usize) -> i64
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`i64`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: i64 = 1
value = I64.wrapping_shl(input, 64) # 1
```

### I64.wrapping_shr

```el
I64.wrapping_shr(value: i64, count: usize) -> i64
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`i64`. The shift preserves the sign bit.
The count has type `usize`.

```el
input: i64 = -2
value = I64.wrapping_shr(input, 1) # -1
```

## Isize wrapping functions

These examples use the supported 64-bit Darwin arm64 target.

### Isize.wrapping_add

```el
Isize.wrapping_add(left: isize, right: isize) -> isize
```

Returns `left + right` modulo the width of `isize`. Overflow wraps
instead of failing, and both operands must have type `isize`.

```el
left: isize = 9223372036854775807
value = Isize.wrapping_add(left, 1) # -9223372036854775808
```

### Isize.wrapping_sub

```el
Isize.wrapping_sub(left: isize, right: isize) -> isize
```

Returns `left - right` modulo the width of `isize`. Underflow wraps
instead of failing, and both operands must have type `isize`.

```el
left: isize = -9223372036854775808
value = Isize.wrapping_sub(left, 1) # 9223372036854775807
```

### Isize.wrapping_mul

```el
Isize.wrapping_mul(left: isize, right: isize) -> isize
```

Returns `left * right` modulo the width of `isize`. Overflow wraps
instead of failing, and both operands must have type `isize`.

```el
left: isize = 9223372036854775807
value = Isize.wrapping_mul(left, 2) # -2
```

### Isize.wrapping_neg

```el
Isize.wrapping_neg(value: isize) -> isize
```

Returns `0 - value` modulo the width of `isize`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: isize = 1
value = Isize.wrapping_neg(input) # -1
```

### Isize.wrapping_shl

```el
Isize.wrapping_shl(value: isize, count: usize) -> isize
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`isize`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: isize = 1
value = Isize.wrapping_shl(input, 64) # 1
```

### Isize.wrapping_shr

```el
Isize.wrapping_shr(value: isize, count: usize) -> isize
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`isize`. The shift preserves the sign bit.
The count has type `usize`.

```el
input: isize = -2
value = Isize.wrapping_shr(input, 1) # -1
```

## U8 wrapping functions

### U8.wrapping_add

```el
U8.wrapping_add(left: u8, right: u8) -> u8
```

Returns `left + right` modulo the width of `u8`. Overflow wraps
instead of failing, and both operands must have type `u8`.

```el
left: u8 = 255
value = U8.wrapping_add(left, 1) # 0
```

### U8.wrapping_sub

```el
U8.wrapping_sub(left: u8, right: u8) -> u8
```

Returns `left - right` modulo the width of `u8`. Underflow wraps
instead of failing, and both operands must have type `u8`.

```el
left: u8 = 0
value = U8.wrapping_sub(left, 1) # 255
```

### U8.wrapping_mul

```el
U8.wrapping_mul(left: u8, right: u8) -> u8
```

Returns `left * right` modulo the width of `u8`. Overflow wraps
instead of failing, and both operands must have type `u8`.

```el
left: u8 = 255
value = U8.wrapping_mul(left, 2) # 254
```

### U8.wrapping_neg

```el
U8.wrapping_neg(value: u8) -> u8
```

Returns `0 - value` modulo the width of `u8`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: u8 = 1
value = U8.wrapping_neg(input) # 255
```

### U8.wrapping_shl

```el
U8.wrapping_shl(value: u8, count: usize) -> u8
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`u8`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: u8 = 1
value = U8.wrapping_shl(input, 8) # 1
```

### U8.wrapping_shr

```el
U8.wrapping_shr(value: u8, count: usize) -> u8
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`u8`. The shift fills high bits with zero.
The count has type `usize`.

```el
input: u8 = 8
value = U8.wrapping_shr(input, 1) # 4
```

## U16 wrapping functions

### U16.wrapping_add

```el
U16.wrapping_add(left: u16, right: u16) -> u16
```

Returns `left + right` modulo the width of `u16`. Overflow wraps
instead of failing, and both operands must have type `u16`.

```el
left: u16 = 65535
value = U16.wrapping_add(left, 1) # 0
```

### U16.wrapping_sub

```el
U16.wrapping_sub(left: u16, right: u16) -> u16
```

Returns `left - right` modulo the width of `u16`. Underflow wraps
instead of failing, and both operands must have type `u16`.

```el
left: u16 = 0
value = U16.wrapping_sub(left, 1) # 65535
```

### U16.wrapping_mul

```el
U16.wrapping_mul(left: u16, right: u16) -> u16
```

Returns `left * right` modulo the width of `u16`. Overflow wraps
instead of failing, and both operands must have type `u16`.

```el
left: u16 = 65535
value = U16.wrapping_mul(left, 2) # 65534
```

### U16.wrapping_neg

```el
U16.wrapping_neg(value: u16) -> u16
```

Returns `0 - value` modulo the width of `u16`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: u16 = 1
value = U16.wrapping_neg(input) # 65535
```

### U16.wrapping_shl

```el
U16.wrapping_shl(value: u16, count: usize) -> u16
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`u16`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: u16 = 1
value = U16.wrapping_shl(input, 16) # 1
```

### U16.wrapping_shr

```el
U16.wrapping_shr(value: u16, count: usize) -> u16
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`u16`. The shift fills high bits with zero.
The count has type `usize`.

```el
input: u16 = 8
value = U16.wrapping_shr(input, 1) # 4
```

## U32 wrapping functions

### U32.wrapping_add

```el
U32.wrapping_add(left: u32, right: u32) -> u32
```

Returns `left + right` modulo the width of `u32`. Overflow wraps
instead of failing, and both operands must have type `u32`.

```el
left: u32 = 4294967295
value = U32.wrapping_add(left, 1) # 0
```

### U32.wrapping_sub

```el
U32.wrapping_sub(left: u32, right: u32) -> u32
```

Returns `left - right` modulo the width of `u32`. Underflow wraps
instead of failing, and both operands must have type `u32`.

```el
left: u32 = 0
value = U32.wrapping_sub(left, 1) # 4294967295
```

### U32.wrapping_mul

```el
U32.wrapping_mul(left: u32, right: u32) -> u32
```

Returns `left * right` modulo the width of `u32`. Overflow wraps
instead of failing, and both operands must have type `u32`.

```el
left: u32 = 4294967295
value = U32.wrapping_mul(left, 2) # 4294967294
```

### U32.wrapping_neg

```el
U32.wrapping_neg(value: u32) -> u32
```

Returns `0 - value` modulo the width of `u32`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: u32 = 1
value = U32.wrapping_neg(input) # 4294967295
```

### U32.wrapping_shl

```el
U32.wrapping_shl(value: u32, count: usize) -> u32
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`u32`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: u32 = 1
value = U32.wrapping_shl(input, 32) # 1
```

### U32.wrapping_shr

```el
U32.wrapping_shr(value: u32, count: usize) -> u32
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`u32`. The shift fills high bits with zero.
The count has type `usize`.

```el
input: u32 = 8
value = U32.wrapping_shr(input, 1) # 4
```

## U64 wrapping functions

### U64.wrapping_add

```el
U64.wrapping_add(left: u64, right: u64) -> u64
```

Returns `left + right` modulo the width of `u64`. Overflow wraps
instead of failing, and both operands must have type `u64`.

```el
left: u64 = 18446744073709551615
value = U64.wrapping_add(left, 1) # 0
```

### U64.wrapping_sub

```el
U64.wrapping_sub(left: u64, right: u64) -> u64
```

Returns `left - right` modulo the width of `u64`. Underflow wraps
instead of failing, and both operands must have type `u64`.

```el
left: u64 = 0
value = U64.wrapping_sub(left, 1) # 18446744073709551615
```

### U64.wrapping_mul

```el
U64.wrapping_mul(left: u64, right: u64) -> u64
```

Returns `left * right` modulo the width of `u64`. Overflow wraps
instead of failing, and both operands must have type `u64`.

```el
left: u64 = 18446744073709551615
value = U64.wrapping_mul(left, 2) # 18446744073709551614
```

### U64.wrapping_neg

```el
U64.wrapping_neg(value: u64) -> u64
```

Returns `0 - value` modulo the width of `u64`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: u64 = 1
value = U64.wrapping_neg(input) # 18446744073709551615
```

### U64.wrapping_shl

```el
U64.wrapping_shl(value: u64, count: usize) -> u64
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`u64`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: u64 = 1
value = U64.wrapping_shl(input, 64) # 1
```

### U64.wrapping_shr

```el
U64.wrapping_shr(value: u64, count: usize) -> u64
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`u64`. The shift fills high bits with zero.
The count has type `usize`.

```el
input: u64 = 8
value = U64.wrapping_shr(input, 1) # 4
```

## Usize wrapping functions

These examples use the supported 64-bit Darwin arm64 target.

### Usize.wrapping_add

```el
Usize.wrapping_add(left: usize, right: usize) -> usize
```

Returns `left + right` modulo the width of `usize`. Overflow wraps
instead of failing, and both operands must have type `usize`.

```el
left: usize = 18446744073709551615
value = Usize.wrapping_add(left, 1) # 0
```

### Usize.wrapping_sub

```el
Usize.wrapping_sub(left: usize, right: usize) -> usize
```

Returns `left - right` modulo the width of `usize`. Underflow wraps
instead of failing, and both operands must have type `usize`.

```el
left: usize = 0
value = Usize.wrapping_sub(left, 1) # 18446744073709551615
```

### Usize.wrapping_mul

```el
Usize.wrapping_mul(left: usize, right: usize) -> usize
```

Returns `left * right` modulo the width of `usize`. Overflow wraps
instead of failing, and both operands must have type `usize`.

```el
left: usize = 18446744073709551615
value = Usize.wrapping_mul(left, 2) # 18446744073709551614
```

### Usize.wrapping_neg

```el
Usize.wrapping_neg(value: usize) -> usize
```

Returns `0 - value` modulo the width of `usize`. The result wraps
instead of failing, including for unsigned operands and the minimum signed
integer.

```el
input: usize = 1
value = Usize.wrapping_neg(input) # 18446744073709551615
```

### Usize.wrapping_shl

```el
Usize.wrapping_shl(value: usize, count: usize) -> usize
```

Shifts `value` left by `count` bits, reducing `count` modulo the width of
`usize`. Discards high bits without an overflow failure. The count has
type `usize`.

```el
input: usize = 1
value = Usize.wrapping_shl(input, 64) # 1
```

### Usize.wrapping_shr

```el
Usize.wrapping_shr(value: usize, count: usize) -> usize
```

Shifts `value` right by `count` bits, reducing `count` modulo the width of
`usize`. The shift fills high bits with zero.
The count has type `usize`.

```el
input: usize = 8
value = Usize.wrapping_shr(input, 1) # 4
```
