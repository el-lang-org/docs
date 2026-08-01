# Protocols

Protocols declare behavior; implementations are explicit. They are EL's
replacement for both interfaces and type classes.

## Declaring a protocol

```el
defprotocol Show do
  def show(value: Self) -> string
end
```

`Self` is the protocol's abstract target type.

## Implementing

```el
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

An implementation must be declared by the package owning either the protocol or
the target type.

## Constrained generics

A generic function constrains a type parameter with `when`:

```el
def max(left: a, right: a) -> a when a: Ord do
  if left >= right do
    left
  else
    right
  end
end
```

Implementations for generic types can constrain their parameters too:

```el
defimpl Show, for: Box(a) when a: Show do
  def show(value: Box(a)) -> string do
    Show.show(value.value)
  end
end
```

Protocol dispatch is **static**. Protocol names are not runtime value types in
v1, and a matching method name does not implicitly satisfy a protocol.

## Associated types

Protocols declare associated types explicitly, and implementations assign them
explicitly:

```el
defprotocol Iterable do
  type Item
  type Cursor

  def iter(value: Self) -> Cursor
  def next(cursor: Cursor) -> {:item, Item, Cursor} | :done
end

defimpl Iterable, for: List(a) do
  type Item = a
  type Cursor = List.Cursor(a)

  def iter(value: List(a)) -> List.Cursor(a) do
    # implementation
  end

  def next(cursor: List.Cursor(a)) ->
      {:item, a, List.Cursor(a)} | :done do
    # implementation
  end
end
```

Generic code uses a qualified projection to name the type selected by an
implementation:

```el
def collect(values: a) -> [Iterable.Item(a)] when a: Iterable do
  # implementation
end
```

## Deriving

`@derive [Eq, Show, Hash]` asks the compiler to generate implementations
where the field constraints hold:

```el
@derive [Eq, Show, Hash]
defstruct Point do
  x: i64
  y: i64
end
```

A conflict between `@derive` and an explicit implementation is a compile-time
error. Overlapping implementations, specialization, and implicit associated-type
inference are also errors.

## Core protocols

The standard library defines `Eq`, `Ord`, `Show`, `Hash`, `Iterable`, `Writer`,
`Reader`, and `Concat`. `==` and ordering operators lower through `Eq` and `Ord`;
`++` lowers through `Concat`; and `for ... in` lowers through `Iterable`.
