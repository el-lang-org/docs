# Protocols

Protocols declare operations with static dispatch. Implementations are explicit;
a matching function name alone does not satisfy a protocol.

## Declare and implement a protocol

```el
module Geometry

protocol Render do
	fn render(value: Self) -> string
end

struct Point do
	x: i64
	y: i64
end

impl Render for Point do
	fn render(value: Point) -> string do
		"Point(#{value.x}, #{value.y})"
	end
end
```

`Self` is the implementation's target type. The implementing package must own
either the protocol or the target type. Protocol signatures and implementation
methods are public; `private fn` is invalid in either place.

## Constrain generics

Functions declare bounds with their type parameters:

```el
fn maximum[T: Ord](left: T, right: T) -> T do
	if left >= right do left else right end
end
```

Generic implementations declare parameters directly on the target type:

```el
struct Box[T] do
	value: T
end

impl Show for Box[T: Show] do
	fn show(value: Box[T]) -> string do
		Show.show(value.value)
	end
end
```

`T: Eq + Hash` requires both protocols. Protocols are not runtime value types,
and there is no protocol inheritance or implicit implementation.

## Associated types

Protocols declare associated types with `type`; implementations assign them
explicitly. This example uses an application-defined protocol:

```el
protocol Source do
	type Item
	fn first(value: Self) -> Option[Item]
end

struct Batch[T] do
	values: [T]
end

impl Source for Batch[T] do
	type Item = T

	fn first(value: Batch[T]) -> Option[T] do
		Enum.at(value.values, 0)
	end
end

fn keep_item[S: Source](source: S, item: Source.Item[S]) -> Source.Item[S] do
	item
end
```

`Source.Item[S]` names the type selected by the implementation for `S`.
`Iterable` similarly declares `Item` and `Cursor`; `Reader` and `Writer` select
an associated `ErrorReason` type.

## Derive implementations

`@derive` generates fieldwise implementations where their constraints hold:

```el
@derive [Eq, Show, Hash]
struct Point do
	x: i64
	y: i64
end
```

Overlapping implementations, specialization, and a derived implementation that
conflicts with an explicit one are compile-time errors. Floats have no `Eq`,
`Ord`, `Hash`, or `Show` implementation, so a float field prevents those derives.

## Core and numeric protocols

| Protocol | Operation |
| --- | --- |
| `Eq`, `Ord` | Equality and ordering |
| `Show`, `Hash` | Diagnostic text and hashing |
| `Iterable` | Iteration through `for` and `Enum` |
| `Reader`, `Writer` | Recoverable byte I/O |
| `Send` | Compiler-derived permission to send values between actors |
| `Concat` | `++` |
| `Add`, `Sub`, `Mul`, `Div`, `Rem`, `Neg`, `Pow` | Arithmetic operators |
| `Number`, `Integer`, `Float` | [Math functions](/std/math) |

Each arithmetic operator needs its own bound, such as `T: Add + Mul`.
`Number` does not imply `Add`. The fixed Unicode infix protocols also require
separate implementations or bounds. See [Operators](/getting-started/operators).

## Reader and Writer failure reasons

```el
protocol Reader do
	type ErrorReason
	fn read(reader: Self, max_bytes: usize) ->
		{:ok, bytes} | :eof | {:error, ErrorReason, string}
end

protocol Writer do
	type ErrorReason
	fn write(writer: Self, data: bytes) -> {:ok, unit} | {:error, ErrorReason, string}
	fn flush(writer: Self) -> {:ok, unit} | {:error, ErrorReason, string}
end
```

These are core declarations shown for reference. A user implementation sets
`type ErrorReason` to its own closed union of reason atoms. Generic [IO
functions](/std/io#generic-readers-and-writers) preserve that reason and its
message through `Reader.ErrorReason[R]` or `Writer.ErrorReason[W]`.

## Send and actor ownership

The compiler derives the methodless `Send` protocol for values that can cross
an actor boundary. An aggregate is sendable when its components are sendable.
Actor-owned resources, mailboxes, and task handles are not sendable. An explicit
`impl Send` is rejected with `E2182`.

Function types satisfy `Send`, but a closure literal passed directly to
`Actor.spawn`, `Actor.start`, or `Task.async` may capture only sendable values.
An owned capture receives `E2183`. A stored closure still has runtime ownership
checks if it accesses another actor's resource. See [Actors and
tasks](/getting-started/concurrency).
