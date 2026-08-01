# Lists and Tuples

## Lists

Lists are immutable and homogeneous. Their type is `[a]`:

```el
numbers: [i64] = [1, 2, 3]
words: [string] = ["one", "two", "three"]
```

List patterns support the empty list and head/tail decomposition. Lowercase type
names in a signature introduce inferred type parameters:

```el
def map(values: [a], f: (a) -> b) -> [b] do
  match values do
    [] -> []
    [value | rest] -> [f(value) | map(rest, f)]
  end
end
```

There is no explicit type-argument syntax at call sites; EL infers concrete
types from arguments and the expected result:

```el
squares = map([1, 2, 3], square)
empty: [i64] = []
```

When needed, an inline type ascription supplies the expected type:

```el
sum(Parser.parse_all(lines) :: [i64])
```

## Tuples and arrays

Tuples and fixed-size arrays have distinct construction syntax:

```el
pair = {"Ada", 42}
array = #[1, 2, 3]
```

Tuples have at least two elements. The number of elements in `#[...]` becomes
the concrete array length:

```el
coordinates = #[10, 20, 30] # inferred [i64; 3]
empty: [u8; 0] = #[]        # empty arrays need an expected item type
```

User-written array types contain literal lengths. They may be generic over the
item type but not over the length:

```el
def first_of_pair(values: [a; 2]) -> a do
  values[0]
end
```

Symbolic `[a; N]`, length arithmetic, and `[a; _]` are not valid v1 source.

## Slices

Algorithms accepting any contiguous length use `Slice(a)`:

```el
def sum(values: Slice(i64)) -> i64 do
  mut total: i64 = 0

  for value in values do
    total := total + value
  end

  total
end

total = sum(Slice.from_array(#[1, 2, 3, 4]))
```

## Indexing

Arrays, slices, bytes, and bits support bounds-checked read indexing by `usize`:

```el
first = array[0]
byte = data[byte_index]
bit: bool = bit_data[bit_index]
```

For `bits`, index zero is the most-significant bit of the first source byte.
Strings, lists, and maps do **not** support indexing. Slices use explicit
construction so sharing and copying remain visible:

```el
whole = Slice.from_array(array)
part = Slice.subslice(whole, 1, 2)
independent = Slice.copy(part)
```

## Collection operations

Structural sizes and conversions live with the collection modules:

```el
reversed = List.reverse([1, 2, 3])
array_count = Array.length(#[1, 2, 3])
slice_count = Slice.length(Slice.from_array(#[1, 2, 3]))
```

Array and slice sizes are O(1). `List.reverse` is O(n) and allocates a fresh
logical value.

`++` concatenates values through the `Concat` protocol. For linked lists,
concatenation copies the left spine, so repeated `++` in a loop can be quadratic.

See the [`List`](/std/list), [`Array`](/std/array), and
[`Slice`](/std/slice) references for the complete function listings.
