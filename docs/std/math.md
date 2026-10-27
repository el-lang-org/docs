# Math

`Math` wraps the independent `Number`, `Integer`, and `Float` protocols.
Arguments to one operation have the same type; no numeric conversion is
implicit. All integer and float primitives implement `Number`, all integer
primitives implement `Integer`, and `f32` and `f64` implement `Float`.

## Functions

These signatures declare their required bounds. Type arguments at call sites
are inferred from operands and expected results.

```el
Math.abs[T: Number](x: T) -> T
Math.sign[T: Number](x: T) -> T
Math.min[T: Number](x: T, y: T) -> T
Math.max[T: Number](x: T, y: T) -> T
Math.clamp[T: Number](x: T, y: T, z: T) -> T
Math.gcd[T: Integer](x: T, y: T) -> T
Math.lcm[T: Integer](x: T, y: T) -> T
Math.div_floor[T: Integer](x: T, y: T) -> T
Math.mod_floor[T: Integer](x: T, y: T) -> T
Math.sqrt[T: Float](x: T) -> T
Math.cbrt[T: Float](x: T) -> T
Math.hypot[T: Float](x: T, y: T) -> T
Math.exp[T: Float](x: T) -> T
Math.exp2[T: Float](x: T) -> T
Math.expm1[T: Float](x: T) -> T
Math.log[T: Float](x: T) -> T
Math.log2[T: Float](x: T) -> T
Math.log10[T: Float](x: T) -> T
Math.log1p[T: Float](x: T) -> T
Math.pow[T: Float](x: T, y: T) -> T
Math.sin[T: Float](x: T) -> T
Math.cos[T: Float](x: T) -> T
Math.tan[T: Float](x: T) -> T
Math.asin[T: Float](x: T) -> T
Math.acos[T: Float](x: T) -> T
Math.atan[T: Float](x: T) -> T
Math.atan2[T: Float](x: T, y: T) -> T
Math.sinh[T: Float](x: T) -> T
Math.cosh[T: Float](x: T) -> T
Math.tanh[T: Float](x: T) -> T
Math.floor[T: Float](x: T) -> T
Math.ceil[T: Float](x: T) -> T
Math.trunc[T: Float](x: T) -> T
Math.round[T: Float](x: T) -> T
Math.copysign[T: Float](x: T, y: T) -> T
Math.is_nan[T: Float](x: T) -> bool
Math.is_inf[T: Float](x: T) -> bool
Math.is_finite[T: Float](x: T) -> bool
Math.pi() -> f64
Math.e() -> f64
Math.inf() -> f64
Math.nan() -> f64
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
