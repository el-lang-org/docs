# Array

Fixed-size arrays are constructed with `#[...]`. Their type is `[A; N]`; the
length is a literal known to the compiler:

```el
coordinates = #[10, 20, 30] # inferred [i64; 3]
empty: [u8; 0] = #[]        # empty arrays need an expected item type
```

## Functions

### Array.length

```el
Array.length[A](values: [A; N]) -> usize
```

Returns the number of elements. It is a compiler-provided standard intrinsic
instantiated for every concrete literal length and is O(1):

```el
count = Array.length(#[10, 20, 30])   # 3
```

## Indexing

Arrays support bounds-checked read indexing by `usize`. An out-of-bounds index
is an unrecoverable runtime failure:

```el
first = array[0]
```

Arrays of different lengths are distinct types and do not convert implicitly.
Standard array implementations of `Eq`, `Ord`, `Hash`, `Show`, and `Iterable`
are generated on the same concrete-length basis when their item constraints
hold.

## Indexed updates

A mutable local holding a fixed array supports `items[index] := value`:

```el
mut items = #[1, 2, 3]
previous = items
items[0] := 9
IO.println(items)    # #[9, 2, 3]
IO.println(previous) # #[1, 2, 3]
```

The operation replaces the array value bound to the local and preserves earlier
copies. The index is `usize`, the item type must match, and bounds are checked.
Slices, bytes, lists, and maps do not support indexed assignment.
