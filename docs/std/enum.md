# Enum

Generic collection traversal lives in `Enum`. Call sites do not write protocol
constraints; every `Enum` function works over any `i: Iterable`. Each
declaration requires `when i: Iterable`; that clause is stated once here rather
than repeated on every signature.

## Functions

### Enum.count

```el
Enum.count(values: i) -> usize
```

Returns the number of items. `count` traverses the iterable and is O(n).

```el
count = Enum.count([10, 20, 30])   # 3
total_words = Enum.count(words)
```

### Enum.at

```el
Enum.at(values: i, index: usize) -> Option(Iterable.Item(i))
```

Finds the item at a zero-based `usize` position. Returns `{:some, item}` when
that position exists, `:none` otherwise, and stops after finding the requested
item.

```el
second: Option(i64) = Enum.at([10, 20, 30], 1)   # {:some, 20}
missing: Option(i64) = Enum.at([10, 20, 30], 3)   # :none

match Enum.at(scores, 0) do
  {:some, first} -> IO.println(first)
  :none -> IO.println("no scores")
end
```

### Enum.to_list

```el
Enum.to_list(values: i) -> [Iterable.Item(i)]
```

Converts the iterable to a list. `to_list` always returns a list because v1 has
no higher-kinded abstraction for reconstructing an arbitrary input container.

```el
entries: [i64] = Enum.to_list(#[1, 2, 3])   # [1, 2, 3]
byte_list: [u8] = Enum.to_list(data)
```

### Enum.map

```el
Enum.map(values: i, function: (Iterable.Item(i)) -> b) -> [b]
```

Returns a list where each element is the result of applying `function` to each
item, in the iterable's order.

```el
def square(value: i64) -> i64 do
  value * value
end

squares: [i64] = Enum.map([1, 2, 3], square)   # [1, 4, 9]
```

### Enum.filter

```el
Enum.filter(values: i, predicate: (Iterable.Item(i)) -> bool) ->
  [Iterable.Item(i)]
```

Returns the items for which `predicate` is `true`, in the iterable's order.

```el
def is_positive(value: i64) -> bool do
  value > 0
end

positive: [i64] = Enum.filter([-2, 0, 3], is_positive)   # [3]
```

### Enum.reduce

```el
Enum.reduce(values: i, initial: a,
  reducer: (a, Iterable.Item(i)) -> a) -> a
```

Threads `reducer` strictly left-to-right over the items, starting from `initial`.

```el
def add(total: i64, value: i64) -> i64 do
  total + value
end

total = Enum.reduce([1, 2, 3], 0, add)   # 6
```

### Enum.each

```el
Enum.each(values: i, function: (Iterable.Item(i)) -> unit) -> unit
```

Visits every item for its effect and returns `unit`.

```el
def print_line(line: string) do
  IO.println(line)
end

Enum.each(["one", "two"], print_line)   # prints "one" then "two"
```

### Enum.any

```el
Enum.any(values: i, predicate: (Iterable.Item(i)) -> bool) -> bool
```

Returns `true` if `predicate` holds for at least one item. `any` stops as soon
as the result is known.

```el
def is_positive(value: i64) -> bool do
  value > 0
end

has_positive = Enum.any([-2, -1, 3], is_positive)   # true
```

### Enum.all

```el
Enum.all(values: i, predicate: (Iterable.Item(i)) -> bool) -> bool
```

Returns `true` if `predicate` holds for every item. `all` stops as soon as the
result is known.

```el
def is_positive(value: i64) -> bool do
  value > 0
end

all_positive = Enum.all([1, 2, 3], is_positive)   # true
```

## Notes

- `to_list`, `map`, and `filter` always return lists, because v1 has no
  higher-kinded abstraction for reconstructing an arbitrary input container.
- On maps the item type is always `{key, value}`, and order is insertion order.
- Function arguments are monomorphic named function values, because v1 has no
  anonymous functions or closures.
- Sorting, searching, zipping, chunking, and similar conveniences are ordinary
  future library growth rather than v1 language surface.
- `Enum` list-producing operations are O(n) and allocate fresh logical values.

## Iteration order

- Lists iterate head to tail; arrays and slices by increasing index.
- `bytes` iterate by increasing byte offset; string views in source order.
- Maps yield `{key, value}` in insertion order.
- All iteration cursors are immutable values.
