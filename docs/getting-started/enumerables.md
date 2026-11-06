# Enumerables

`Enum` traverses lists, arrays, slices, bytes, string views, and maps through
`Iterable`. Callbacks may be named functions, closures, or capture shorthand:

```el
squares: [i64] = Enum.map([1, 2, 3], &(&1 * &1)) # [1, 4, 9]
total = Enum.reduce([1, 2, 3], 0, &(&1 + &2))    # 6
second: Option[i64] = Enum.at([10, 20, 30], 1)  # {:some, 20}
missing: Option[i64] = Enum.at([10, 20, 30], 3)  # :none

minimum: i64 = 0
positive = Enum.filter([-2, 0, 3], fn value -> value > minimum end) # [3]
has_positive = Enum.any([-2, -1, 3], &(&1 > 0)) # true
all_positive = Enum.all([1, 2, 3], &(&1 > 0))   # true
```

Closures capture immutable snapshots of referenced outer values. Parameters
infer their types from the expected callback type or body constraints.

## Reduce in order

`Enum.reduce` passes each item before the accumulator. This order matters when
the operation is not commutative:

```el
number = Enum.reduce([1, 2, 3], 0, fn digit, total -> total * 10 + digit end)
# 123
```

Older callbacks used `fn accumulator, item -> ... end`. Swap those parameters
when you update existing code.

Use `Enum.reduce_while` to stop before the end of the input:

```el
total = Enum.reduce_while([1, 2, 3, 4], 0, fn item, sum ->
	if item == 3 do {:halt, sum} else {:cont, sum + item} end
end) # 3
```

`{:cont, state}` continues. `{:halt, state}` returns immediately. Empty input
returns the initial value without a callback. A halt prevents the next cursor
advance too. A `return` inside the callback only exits the callback.

All states have the same type. For success and error alternatives, annotate the
initial value with the full union. See [Enum.reduce_while](/std/enum#enum-reduce-while)
for callback type requirements.

## Count distinct items

`Enum.frequencies` counts each distinct item into a `Map[Item, usize]`.
Items need `Eq` and `Hash`; map entries follow the order of first appearance:

```el
counts: Map[string, usize] = Enum.frequencies(["a", "b", "a"])
# %{"a" => 2, "b" => 1}
```

## Iteration order

Maps yield `{key, value}` pairs in insertion order. Lists traverse head to tail,
arrays and slices by index, bytes by byte offset, and string views in source
order. `map`, `filter`, and `to_list` return lists.

See the [Enum reference](/std/enum) for signatures and the
[Set](/std/set), [Queue](/std/queue), and [Heap](/std/heap) references for
additional persistent collections.

## Custom iteration

`for` and the traversal functions select the source's `Iterable`
implementation. `iter` creates a cursor once; `next` returns an item and the
next cursor, or `:done`. The compiler uses the same calls for custom sources:

```el
struct Countdown do
	from: i64
end

impl Iterable for Countdown do
	type Item = i64
	type Cursor = i64

	# Returns the initial cursor from value.from. Nonpositive values are empty.
	fn iter(value: Countdown) -> i64 do
		value.from
	end

	# Returns cursor and its successor, or :done when cursor is nonpositive.
	fn next(cursor: i64) -> {:item, i64, i64} | :done do
		if cursor > 0 do {:item, cursor, cursor - 1} else :done end
	end
end

for value in %Countdown{from: 3} do
	IO.println(value)
end
# Prints 3, 2, and 1 on separate lines.
```

Lists advance by their remaining tail, so a complete list traversal is linear.
String-view cursors advance by byte offset. Arrays use slice views for
iteration. The source expression is evaluated exactly once.
