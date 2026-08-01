# Array

Fixed-size arrays are constructed with `#[...]`. Their type is `[a; N]`; the
length is a literal known to the compiler:

```el
coordinates = #[10, 20, 30] # inferred [i64; 3]
empty: [u8; 0] = #[]        # empty arrays need an expected item type
```

## Functions

### Array.length

```el
Array.length(values: [a; N]) -> usize
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
