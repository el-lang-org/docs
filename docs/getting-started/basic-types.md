# Basic types

In this chapter we learn about EL's basic types: booleans, integers, floats,
runes, strings, bytes, bits, and atoms. Other data types, such as lists and
tuples, will be explored in the next chapter.

## Scalar types

Primitive type names are lower case:

```text
bool
i8 i16 i32 i64 isize
u8 u16 u32 u64 usize
f32 f64
rune string bytes bits
unit
```

- `bool` has two values: `true` and `false`.
- `rune` is one Unicode scalar value. `string` is valid UTF-8 text, `bytes` is
  raw binary data, and `bits` is an arbitrary bit sequence.
- Fixed-width integers are two's complement; `isize`/`usize` match the target's
  pointer width.
- `f32`/`f64` are IEEE 754 binary32/binary64.

## Basic arithmetic

Open a source file and type the following expressions:

```el
answer = 1 + 2
product = 5 * 5
quotient = 10 / 2
```

- Unconstrained integer literals default to `i64`; unconstrained floating
  literals default to `f64`. Floats in EL are at least 64-bit precision.
- Integer division truncates toward zero.
- Integer arithmetic is **checked for overflow in every build mode**.

Numeric types do not coerce implicitly. Convert explicitly when types differ:

```el
wide: i64 = 100
narrow: i32 = i32(wide)
```

EL supports shortcut notations for entering binary, octal, and hexadecimal
numbers. Digits may be separated with `_` for readability:

```el
mask = 0xff_00           # hex with digit separators
permissions = 0b110_100  # binary
octal = 0o777            # octal
ratio = 1.5e-3           # float, scientific notation
```

Float numbers require a dot followed by at least one digit and support `e` for
scientific notation. V1 has no numeric suffixes, hexadecimal floats, or literal
NaN/infinity.

```el
# Rejected: implicit numeric conversion
small: i32 = 1
large: i64 = small
```

## Booleans

EL supports `true` and `false` as values of type `bool`:

```el
ready = true
rejected = true == false
```

Three boolean operators are available: `and`, `or`, and `not`. They are strict
in the sense that every operand must have type `bool`:

```el
both = true and false    # false
either = false or true   # true
opposite = not true      # false
```

There is no truthiness: integers, strings, lists, and other values cannot be
used as conditions.

```el
# Rejected: integer in a condition
if 1 do
  IO.println("unreachable")
end
```

`and` and `or` are short-circuit operators. They only evaluate the right side if
the left side is not enough to determine the result.

EL has **no `nil`**, `null`, nullable references, or implicit zero values.
Absence of a value is expressed with the reserved core prelude type
`Option(a) = {:some, a} | :none`, or with atoms such as `:none` and `:error`.

## Atoms

An atom is a constant whose value is its own name. Atoms are written with a
leading colon in `snake_case`:

```el
status = :not_found
```

Atoms are equal if their names are equal:

```el
same = :apple == :apple     # true
different = :apple == :orange # false
```

Often they are used to express the state of an operation, by using values such
as `:ok` and `:error`:

```el
match Parser.parse_int(input) do
  {:ok, value} -> value
  {:error, reason} -> IO.report(reason)
end
```

Unlike some languages with symbol aliases, EL booleans are **not** atoms:
`true` and `false` are the primitive type `bool`.

## Strings

Strings in EL are delimited by double quotes and always contain valid UTF-8:

```el
message = "hellö"
```

Strings are not indexable. The unit of inspection is explicit:

```el
byte_count = String.byte_size(message)      # 6, ö is two UTF-8 bytes
grapheme_count = String.length(message)     # 5 graphemes
codepoints: [rune] = String.codepoints(message)
graphemes: [string] = String.graphemes(message)
```

You can concatenate two strings with the `++` operator:

```el
greeting = "hello " ++ "world!"
```

Strings can have line breaks. You can introduce them using escape sequences:

```el
message = "line one\nline two"
```

You can print a string using `IO.println`:

```el
IO.println("hello\nworld")
```

A `rune` is a single Unicode scalar value, written with single quotes:

```el
letter = 'λ'
```

::: warning Not in v1
String interpolation, raw and multiline strings, and integer indexing are not
part of v1.
:::

## Structural comparison

EL provides `==`, `!=`, `<=`, `>=`, `<`, and `>` as comparison operators, plus
the strict `===` and `!==` operators:

```el
equal = "foo" == "foo"     # true
unequal = "foo" == "bar"   # false
ordered = 1 < 2            # true
```

Because there is no implicit numeric conversion, `===`/`!==` require the exact
same type in addition to the same value:

```el
loose = 1 == 1     # true
strict = 1 === 1.0 # false
```

These operators perform *structural comparison*: values are equal when their
structure, including nested contents, matches. Floats follow IEEE 754 (NaN,
signed zero, and ordered comparisons), but do not implement `Eq`, `Ord`, or
`Hash` in v1, so they cannot be map keys.

Evaluation is eager, exactly once, and left to right — including operands,
arguments, and initializers. `and` and `or` short-circuit.

The collection types — lists and tuples — are covered in the next chapter.
