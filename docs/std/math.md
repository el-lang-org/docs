# Math

`Math` wraps the independent `Number`, `Integer`, and `Float` protocols.
Arguments to one operation have the same type; no numeric conversion is
implicit. All integer and float primitives implement `Number`, all integer
primitives implement `Integer`, and `f32` and `f64` implement `Float`.

## Functions

These signatures declare their required bounds. Type arguments at call sites
are inferred from operands and expected results.

### Math.abs

```el
Math.abs[T: Number](x: T) -> T
```

Returns the absolute value of `x` with the same numeric type. A minimum
signed integer fails with checked overflow. For floats, the result clears the
sign bit.

```el
value = Math.abs(-7) # 7
```

### Math.sign

```el
Math.sign[T: Number](x: T) -> T
```

Returns negative one, zero, or one in the type of `x`. Float zeros keep
their sign, and NaN stays NaN.

```el
value = Math.sign(-7) # -1
```

### Math.min

```el
Math.min[T: Number](x: T, y: T) -> T
```

Returns the smaller of `x` and `y`. Float NaN propagates, and negative
zero sorts below positive zero.

```el
value = Math.min(3, 5) # 3
```

### Math.max

```el
Math.max[T: Number](x: T, y: T) -> T
```

Returns the larger of `x` and `y`. Float NaN propagates, and positive
zero sorts above negative zero.

```el
value = Math.max(3, 5) # 5
```

### Math.clamp

```el
Math.clamp[T: Number](x: T, y: T, z: T) -> T
```

Limits `x` to the range from `y` (lower bound) to `z` (upper bound):
`min(max(x, y), z)`.

```el
value = Math.clamp(15, 0, 10) # 10
```

### Math.gcd

```el
Math.gcd[T: Integer](x: T, y: T) -> T
```

Returns the greatest common divisor of integers `x` and `y`, never negative; `gcd(0, 0)`
is `0`. An unrepresentable nonnegative result fails with checked overflow.

```el
value = Math.gcd(12, 18) # 6
```

### Math.lcm

```el
Math.lcm[T: Integer](x: T, y: T) -> T
```

Returns the least common multiple of integers `x` and `y`, never negative; `0` if either
is `0`. The result can overflow the integer type.

```el
value = Math.lcm(4, 6) # 12
```

### Math.div_floor

```el
Math.div_floor[T: Integer](x: T, y: T) -> T
```

Returns the integer quotient `x / y` rounded toward negative infinity. A zero divisor or the minimum signed integer divided by negative one fails
with checked arithmetic.

```el
value = Math.div_floor(-7, 3) # -3
```

### Math.mod_floor

```el
Math.mod_floor[T: Integer](x: T, y: T) -> T
```

Returns the integer remainder of `x` by `y` taking the sign of `y`. A zero divisor or the minimum signed integer modulo negative one fails
with checked arithmetic.

```el
value = Math.mod_floor(-7, 3) # 2
```

### Math.sqrt

```el
Math.sqrt[T: Float](x: T) -> T
```

Returns the square root of float `x`; NaN when `x` is negative.

```el
IO.println(Format.float(Math.sqrt(9.0), 1)) # 3.0
```

### Math.cbrt

```el
Math.cbrt[T: Float](x: T) -> T
```

Returns the cube root of float `x`.

```el
IO.println(Format.float(Math.cbrt(8.0), 1)) # 2.0
```

### Math.hypot

```el
Math.hypot[T: Float](x: T, y: T) -> T
```

Returns `sqrt(x*x + y*y)` for floats, without intermediate overflow.

```el
IO.println(Format.float(Math.hypot(3.0, 4.0), 1)) # 5.0
```

### Math.exp

```el
Math.exp[T: Float](x: T) -> T
```

Returns `e` raised to the float `x`.

```el
IO.println(Format.float(Math.exp(0.0), 1)) # 1.0
```

### Math.exp2

```el
Math.exp2[T: Float](x: T) -> T
```

Returns `2` raised to the float `x`.

```el
IO.println(Format.float(Math.exp2(3.0), 1)) # 8.0
```

### Math.expm1

```el
Math.expm1[T: Float](x: T) -> T
```

Returns `exp(x) - 1` for float `x`, accurate when `x` is small.

```el
IO.println(Format.float(Math.expm1(0.0), 1)) # 0.0
```

### Math.log

```el
Math.log[T: Float](x: T) -> T
```

Returns the natural logarithm of float `x`; NaN for negative `x`, `-inf` for zero.

```el
IO.println(Format.float(Math.log(1.0), 1)) # 0.0
```

### Math.log2

```el
Math.log2[T: Float](x: T) -> T
```

Returns the base-2 logarithm of float `x`; NaN for negative `x`, `-inf` for zero.

```el
IO.println(Format.float(Math.log2(8.0), 1)) # 3.0
```

### Math.log10

```el
Math.log10[T: Float](x: T) -> T
```

Returns the base-10 logarithm of float `x`; NaN for negative `x`, `-inf` for zero.

```el
IO.println(Format.float(Math.log10(100.0), 1)) # 2.0
```

### Math.log1p

```el
Math.log1p[T: Float](x: T) -> T
```

Returns `log(1 + x)` for float `x`, accurate when `x` is small.

```el
IO.println(Format.float(Math.log1p(0.0), 1)) # 0.0
```

### Math.pow

```el
Math.pow[T: Float](x: T, y: T) -> T
```

Returns float `x` raised to float `y`, following C `pow`. For general exponents on any
numeric type use the `**` operator.

```el
IO.println(Format.float(Math.pow(2.0, 3.0), 1)) # 8.0
```

### Math.sin

```el
Math.sin[T: Float](x: T) -> T
```

Returns the sine of `x`, in radians.

```el
IO.println(Format.float(Math.sin(0.0), 1)) # 0.0
```

### Math.cos

```el
Math.cos[T: Float](x: T) -> T
```

Returns the cosine of `x`, in radians.

```el
IO.println(Format.float(Math.cos(0.0), 1)) # 1.0
```

### Math.tan

```el
Math.tan[T: Float](x: T) -> T
```

Returns the tangent of `x`, in radians.

```el
IO.println(Format.float(Math.tan(0.0), 1)) # 0.0
```

### Math.asin

```el
Math.asin[T: Float](x: T) -> T
```

Returns the arcsine of `x` in radians (-pi/2 to pi/2); NaN when `x` is outside -1 to 1.

```el
IO.println(Format.float(Math.asin(0.0), 1)) # 0.0
```

### Math.acos

```el
Math.acos[T: Float](x: T) -> T
```

Returns the arccosine of `x` in radians (0 to pi); NaN when `x` is outside -1 to 1.

```el
IO.println(Format.float(Math.acos(1.0), 1)) # 0.0
```

### Math.atan

```el
Math.atan[T: Float](x: T) -> T
```

Returns the arctangent of `x` in radians (-pi/2 to pi/2).

```el
IO.println(Format.float(Math.atan(0.0), 1)) # 0.0
```

### Math.atan2

```el
Math.atan2[T: Float](x: T, y: T) -> T
```

Returns the angle in radians between negative pi and pi. The first
argument `x` is the vertical coordinate, and the second `y` is the horizontal
coordinate, following the argument order of C `atan2(y, x)`.

```el
IO.println(Format.float(Math.atan2(1.0, 1.0), 1)) # 0.8
```

### Math.sinh

```el
Math.sinh[T: Float](x: T) -> T
```

Returns the hyperbolic sine of `x`.

```el
IO.println(Format.float(Math.sinh(0.0), 1)) # 0.0
```

### Math.cosh

```el
Math.cosh[T: Float](x: T) -> T
```

Returns the hyperbolic cosine of `x`.

```el
IO.println(Format.float(Math.cosh(0.0), 1)) # 1.0
```

### Math.tanh

```el
Math.tanh[T: Float](x: T) -> T
```

Returns the hyperbolic tangent of `x`.

```el
IO.println(Format.float(Math.tanh(0.0), 1)) # 0.0
```

### Math.floor

```el
Math.floor[T: Float](x: T) -> T
```

Returns the largest whole number not greater than `x`, as a float.

```el
IO.println(Format.float(Math.floor(2.7), 1)) # 2.0
```

### Math.ceil

```el
Math.ceil[T: Float](x: T) -> T
```

Returns the smallest whole number not less than `x`, as a float.

```el
IO.println(Format.float(Math.ceil(2.1), 1)) # 3.0
```

### Math.trunc

```el
Math.trunc[T: Float](x: T) -> T
```

Returns `x` with the fractional part dropped (toward zero), as a float.

```el
IO.println(Format.float(Math.trunc(-2.7), 1)) # -2.0
```

### Math.round

```el
Math.round[T: Float](x: T) -> T
```

Returns `x` rounded to the nearest whole number, halves away from zero, as a float.

```el
IO.println(Format.float(Math.round(-2.5), 1)) # -3.0
```

### Math.copysign

```el
Math.copysign[T: Float](x: T, y: T) -> T
```

Returns the magnitude of float `x` with the sign of `y`.

```el
IO.println(Format.float(Math.copysign(3.0, -1.0), 1)) # -3.0
```

### Math.is_nan

```el
Math.is_nan[T: Float](x: T) -> bool
```

Returns `true` when float `x` is NaN. NaN is the only value for which `x != x`.

```el
value = Math.is_nan(Math.nan()) # true
```

### Math.is_inf

```el
Math.is_inf[T: Float](x: T) -> bool
```

Returns `true` when float `x` is positive or negative infinity.

```el
value = Math.is_inf(Math.inf()) # true
```

### Math.is_finite

```el
Math.is_finite[T: Float](x: T) -> bool
```

Returns `true` when float `x` is neither infinity nor NaN.

```el
value = Math.is_finite(1.0) # true
```

### Math.pi

```el
Math.pi() -> f64
```

Returns pi as an `f64`. Convert explicitly with `f32(Math.pi())` when
binary32 precision is required.

```el
IO.println(Format.float(Math.pi(), 1)) # 3.1
```

### Math.e

```el
Math.e() -> f64
```

Returns Euler's number as an `f64`.

```el
IO.println(Format.float(Math.e(), 1)) # 2.7
```

### Math.inf

```el
Math.inf() -> f64
```

Returns positive infinity as an `f64` (`1.0 / 0.0`). Negate it for negative
infinity.

```el
IO.println(Format.float(Math.inf(), 1)) # inf
```

### Math.nan

```el
Math.nan() -> f64
```

Returns a NaN `f64` (`0.0 / 0.0`). NaN compares unequal to everything, itself
included; test with `Math.is_nan`.

```el
IO.println(Format.float(Math.nan(), 1)) # NaN
```

## Number operations

`abs` returns magnitude; `sign` returns the sign as one, zero, or negative one.
For floats, `sign` preserves zero and NaN. Float `min` and `max` propagate NaN
and order negative zero before positive zero.

`clamp(x, low, high)` is `min(max(x, low), high)`. Reversed bounds return `high`;
a NaN argument propagates. The absolute value of a minimum signed integer
fails through checked arithmetic.

## Integer operations

`gcd` and `lcm` return nonnegative results. `gcd(0, 0)` and `lcm(0, x)` are zero.
An unrepresentable result fails through checked arithmetic.

`div_floor` rounds toward negative infinity. `mod_floor` has the divisor's sign.
Both reject zero divisors and signed minimum divided by negative one.

```el
Math.gcd(12, 18)     # 6
Math.div_floor(-7, 3) # -3
Math.mod_floor(-7, 3) # 2
```

## Float operations and constants

Float operations use libm results. Domain errors return NaN or infinity;
`is_nan`, `is_inf`, and `is_finite` return booleans. `round` rounds ties away
from zero, so `Math.round(-2.5)` is `-3.0`.

`pi`, `e`, `inf`, and `nan` return `f64`. Use explicit conversion for `f32`.
Floats still lack `Eq`, `Ord`, `Hash`, and `Show`. Use
[Format.float](/std/format#float-text) for output:

```el
length = Math.hypot(3.0, 4.0)
IO.println(Format.float(length, 1)) # 5.0
```

Arithmetic customization and `**` use separate protocols. See
[Operators](/getting-started/operators) and the runnable
[math operators example](https://github.com/el-lang-org/el/tree/main/examples/math_operators).
