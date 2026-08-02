# Structs

## Declaration and construction

`defstruct` declares a nominal type with immutable fields. Every field must be
initialized:

```el
@derive [Eq, Show, Hash]
defstruct User do
  id: u64
  name: string
end

user = %User{id: 1, name: "Ada"}
```

## Value semantics

Structs have value semantics and no observable identity. Copying a struct is a
shallow fieldwise copy; immutable reference-backed fields may share storage.

An immutable struct update, `%{value | field: replacement}`, returns a new
struct with the named field replaced and leaves `value` unchanged. Multiple
fields may be replaced in one expression:

```el
original = %User{id: 1, name: "Ada"}
renamed = %{original | name: "Grace"}

# original.name is still "Ada"
# renamed.name is "Grace"

older = %{original | id: 2, name: "Grace"}
```

Fields are not independently mutable, but a direct field update may reconstruct
a struct and rebind a mutable local:

```el
mut renamed = original
renamed.name := "Grace"
```

The root must be a mutable local, the assigned value must have exactly the
field's type, and the update evaluates to `unit`. V1 does not accept nested
field paths, indexed targets, parameters, temporaries, or call results as update
targets:

```el
# Rejected: updating a field through an immutable root
point = %Point{x: 1, y: 2}
point.x := 2

# Rejected: nested field and indexed updates
mut user = initial_user
user.address.city := "Paris"

mut items = initial_items
items[0] := replacement
```

## Generic structs

```el
defstruct Box(a) do
  value: a
end

defstruct Pair(a, b) do
  first: a
  second: b
end
```

Type application uses parentheses:

```el
boxed: Box(i64) = %Box{value: 42}
pair: Pair(string, i64) = %Pair{first: "age", second: 37}
```

## Recursive data

Recursive nominal data must cross **managed indirection**. A list-backed tree
node is valid:

```el
defstruct Node do
  value: i64
  children: [Node]
end
```

A direct field, tuple, fixed array, structural union, or user-defined value
struct does not break a recursive layout cycle:

```el
# Rejected: direct recursion without managed indirection
defstruct InvalidNode do
  next: InvalidNode
end
```

## Deriving

`@derive` placed immediately before a `defstruct` declaration asks the compiler
to generate protocol implementations (compiler-generated `defimpl` blocks), so
no manual `defimpl` is needed. Each protocol is implemented field by field:

- `Eq` — structural equality backing `==` and `!=`: two structs are equal when
  every field is equal.
- `Ord` — a total order backing `<`, `<=`, `>`, and `>=`: fields compare
  lexicographically in declaration order, with a proper prefix sorting first.
- `Show` — a readable conversion to `string`, used by `IO.print`, `IO.println`,
  and `IO.report`. The output is human-readable diagnostics, not a stable
  serialization format.
- `Hash` — feeds every field, in declaration order, into the seeded hasher used
  by maps. It is consistent with derived `Eq`: values equal under `==` produce
  equivalent hash data.

```el
@derive [Eq, Show, Hash]
defstruct User do
  id: u64
  name: string
end

first = %User{id: 1, name: "Ada"}
second = %User{id: 1, name: "Ada"}
other = %User{id: 2, name: "Grace"}

first == second     # true
first != other      # true
IO.println(other)   # prints through derived Show
```

Ordering is decided by the earliest differing field:

```el
@derive [Ord]
defstruct Point do
  x: i64
  y: i64
end

%Point{x: 1, y: 2} < %Point{x: 1, y: 3}   # true; y breaks the tie
%Point{x: 1, y: 3} < %Point{x: 2, y: 0}   # true; x decides
```

Deriving succeeds only when every participating field implements the requested
protocol; otherwise the declaration is rejected at compile time. Deriving `Eq`
for `User` above requires `Eq` for both `u64` and `string`. Because `f32` and
`f64` implement none of `Eq`, `Ord`, or `Hash` (IEEE NaN violates the protocol
laws), a floating-point field prevents deriving those protocols for its struct.
`Show` is unaffected:

```el
@derive [Show]   # accepted: floats still implement Show
defstruct Measurement do
  value: f64
end

# Rejected: f64 implements neither Eq nor Hash
@derive [Eq, Hash]
defstruct BadMeasurement do
  value: f64
end
```

A field whose type does not implement a protocol blocks derivation for it — for
example, `Map(k, v)` implements `Eq` and `Show` but neither `Ord` nor `Hash`, so
a struct with a map field can derive only the former two. Only a subset of
protocols may be requested, such as `@derive [Show]`.

For generic structs, the generated implementation carries a `when` constraint on
the struct's type parameters, so it exists exactly where the field constraints
hold:

```el
@derive [Eq, Show]
defstruct Box(a) do
  value: a
end

# The compiler generates:
#   defimpl Eq,   for: Box(a) when a: Eq
#   defimpl Show, for: Box(a) when a: Show

boxed: Box(i64) = %Box{value: 42}   # ok: i64 implements Eq and Show
```

`@derive` and an explicit `defimpl` for the same protocol and struct conflict
and are a compile-time error:

```el
# Rejected: the derived and explicit Show implementations conflict
@derive [Eq, Show]
defstruct Point do
  x: i64
  y: i64
end

defimpl Show, for: Point do
  def show(value: Point) -> string do
    "Point(" ++ Show.show(value.x) ++ ", " ++ Show.show(value.y) ++ ")"
  end
end
```
