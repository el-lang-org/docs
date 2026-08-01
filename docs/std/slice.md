# Slice

Algorithms accepting any contiguous length use `Slice(a)`. Slices are
constructed and subdivided through functions rather than range syntax.

## Functions

### Slice.from_array

```el
Slice.from_array(array: [a; N]) -> Slice(a)
```

Creates a managed view over the array's elements. It is a compiler-provided
standard intrinsic instantiated for every concrete literal length:

```el
whole = Slice.from_array(array)
```

### Slice.subslice

```el
Slice.subslice(slice: Slice(a), start: usize, length: usize) -> Slice(a)
```

Returns a bounds-checked view sharing the backing storage:

```el
part = Slice.subslice(whole, 1, 2)
```

### Slice.copy

```el
Slice.copy(slice: Slice(a)) -> Slice(a)
```

Creates a compact independent managed copy:

```el
independent = Slice.copy(part)
```

### Slice.length

```el
Slice.length(values: Slice(a)) -> usize
```

Returns the number of elements. It is O(1):

```el
count = Slice.length(Slice.from_array(#[1, 2, 3]))   # 3
```

## Indexing

Slices support bounds-checked read indexing by `usize`. An out-of-bounds index
is an unrecoverable runtime failure:

```el
first = slice[0]
```

V1 has no slice literal or range expression; construction stays explicit so
sharing and copying remain visible.
