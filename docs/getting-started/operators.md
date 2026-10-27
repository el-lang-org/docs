# Operators

EL evaluates operands exactly once, left to right. Numeric operands have the
same type, with no implicit conversions. Integers use checked arithmetic in
development and optimized builds.

## Arithmetic protocols

| Operator | Protocol method |
| --- | --- |
| `+` | `Add.add` |
| binary `-` | `Sub.sub` |
| `*` | `Mul.mul` |
| `/` | `Div.div` |
| `%` | `Rem.rem` |
| unary `-` | `Neg.neg` |
| `**` | `Pow.pow` |

Binary methods take two `Self` values and return `Self`. `Neg.neg` takes one.
All numeric primitives implement the binary protocols; signed integers and
floats implement `Neg`. Unsigned negation is invalid.

Custom types require explicit implementations. Generic functions need a bound
for each operator they use:

```el
module Main

struct Vector do
	x: i64
	y: i64
end

impl Add for Vector do
	fn add(left: Vector, right: Vector) -> Vector do
		%Vector{x: left.x + right.x, y: left.y + right.y}
	end
end

fn sum3[T: Add](first: T, second: T, third: T) -> T do
	first + second + third
end

fn main() do
	value = %Vector{x: 1, y: 2}
	result = sum3(value, value, value)
	IO.println(result.x) # 3
end
```

`Number`, `Integer`, and `Float` provide [Math functions](/std/math); they do
not imply arithmetic bounds.

## Exponentiation

`**` associates right and binds tighter than a prefix operator on its left:

```el
2 ** 10     # 1024
2 ** 3 ** 2 # 512
-2 ** 2     # -4
(-2) ** 2   # 4
0 ** 0      # 1
```

A prefix expression is allowed on the right, so `2 ** -3` means `2 ** (-3)`.
For integers, a negative exponent or overflow fails with `integer_overflow`.
Statically known failures receive diagnostic `E2106`. Both integer operands
have the same type. Float power uses `Float.pow` and libm domain behavior.

## Fixed Unicode infix operators

EL reserves these spellings and precedence levels. Each requires its own
implementation or generic bound; numeric types have no implicit implementations.
Identifiers remain ASCII-only, and programs cannot invent operator spellings.

| Symbol | Protocol method | Precedence | Association |
| --- | --- | --- | --- |
| `⊕` | `OPlus.oplus` | Additive | Left |
| `⊖` | `OMinus.ominus` | Additive | Left |
| `⊗` | `OTimes.otimes` | Multiplicative | Left |
| `⊙` | `ODot.odot` | Multiplicative | Left |
| `×` | `Cross.cross` | Multiplicative | Left |
| `⋅` | `Dot.dot` | Multiplicative | Left |
| `∘` | `Compose.compose` | Multiplicative | Left |
| `≈` | `Approx.approx` | Comparison | None |

Both operands must have identical types. Methods return `Self`, except
`Approx.approx`, which returns `bool`. `Dot.dot` therefore cannot return a
scalar from vector operands under this contract. Comparisons cannot chain,
including mixed chains with `≈`.

## Function composition

The prelude implements `Compose` for `(T) -> T`. `left ∘ right` returns a
closure that applies `right` first and then `left`. The composition captures
both function values when formed:

```el
fn scale(factor: f64) -> (f64) -> f64 do
	fn value: f64 -> value * factor end
end

fn offset(bias: f64) -> (f64) -> f64 do
	fn value: f64 -> value + bias end
end

fn demo() do
	calibrate = offset(1.0) ∘ scale(2.0)
	IO.println(Format.float(calibrate(3.0), 1)) # 7.0
end
```

The function types on both sides must match. Heterogeneous composition is
outside this protocol. The runnable
[math operators example](https://github.com/el-lang-org/el/tree/main/examples/math_operators)
implements all eight Unicode operators and lists their expected output.
