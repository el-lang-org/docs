# List

Linked lists are immutable and homogeneous. Their type is `[a]`:

```el
numbers: [i64] = [1, 2, 3]
words: [string] = ["one", "two", "three"]
```

## Functions

### List.reverse

```el
List.reverse(values: [a]) -> [a]
```

Returns the elements in reverse order. It is O(n) and allocates a fresh logical
value:

```el
reversed = List.reverse([1, 2, 3])   # [3, 2, 1]
```

## Notes

List patterns support the empty list and head/tail decomposition (`[]`,
`[value | rest]`). Lists do not support index syntax. `++` concatenates through
the `Concat` protocol; for linked lists concatenation copies the left spine, so
repeated `++` in a loop can be quadratic. There is no `List.new`: an empty list
is written `[]` with an expected type when necessary.
