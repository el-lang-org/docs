# Set

`Set.Set[A]` is an immutable insertion-ordered set backed by `Map[A, bool]`.
Every operation requires `A: Eq + Hash`. Updates return a new set and leave the
original usable. Adding an existing item preserves its position.

## Functions

### Set.new

```el
Set.new[A: Eq + Hash]() -> Set.Set[A]
```

Returns an empty set. Items must support `Eq` and `Hash`.

```el
set: Set.Set[i64] = Set.new()
```

### Set.put

```el
Set.put[A: Eq + Hash](set: Set.Set[A], item: A) -> Set.Set[A]
```

Returns a set that also contains `item`. `set` is unchanged (the set is
persistent). Adding an item already present leaves the contents the same.

```el
set = Set.from_list([1, 2])
next = Set.put(set, 3)
items = Set.to_list(next) # [1, 2, 3]
```

### Set.remove

```el
Set.remove[A: Eq + Hash](set: Set.Set[A], item: A) -> Set.Set[A]
```

Returns a set without `item`. `set` is unchanged.

```el
set = Set.from_list([1, 2, 3])
items = Set.to_list(Set.remove(set, 2)) # [1, 3]
```

### Set.contains

```el
Set.contains[A: Eq + Hash](set: Set.Set[A], item: A) -> bool
```

Returns true when `item` is in `set`.

```el
present = Set.contains(Set.from_list([1, 2]), 2) # true
```

### Set.size

```el
Set.size[A: Eq + Hash](set: Set.Set[A]) -> usize
```

Returns the number of distinct items in `set`.

```el
set = Set.from_list([10, 20])
value = Set.size(set) # 2
```

### Set.to_list

```el
Set.to_list[A: Eq + Hash](set: Set.Set[A]) -> [A]
```

Returns the items of `set` as a list, in the set's insertion order.

```el
items = Set.to_list(Set.from_list([3, 1, 2])) # [3, 1, 2]
```

### Set.from_list

```el
Set.from_list[A: Eq + Hash](items: [A]) -> Set.Set[A]
```

Builds a set from `items`; duplicates collapse to one entry.

```el
set = Set.from_list([3, 1, 2])
```

### Set.union

```el
Set.union[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
```

Returns a set containing every item of `left` or `right`. Inputs are
unchanged.

```el
left = Set.from_list([1, 2])
right = Set.from_list([2, 3])
items = Set.to_list(Set.union(left, right)) # [1, 2, 3]
```

### Set.intersection

```el
Set.intersection[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
```

Returns a set of the items present in both `left` and `right`. Inputs are
unchanged.

```el
left = Set.from_list([1, 2])
right = Set.from_list([2, 3])
items = Set.to_list(Set.intersection(left, right)) # [2]
```

### Set.difference

```el
Set.difference[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
```

Returns a set of the items of `left` that are not in `right`. Inputs are
unchanged.

```el
left = Set.from_list([1, 2])
right = Set.from_list([2, 3])
items = Set.to_list(Set.difference(left, right)) # [1]
```

### Set.subset

```el
Set.subset[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> bool
```

Returns true when every item of `left` is also in `right` (an empty `left` is
always a subset).

```el
contained = Set.subset(Set.from_list([2]), Set.from_list([1, 2])) # true
```

`to_list` follows insertion order. `union` starts with the left set's order and
appends new right-hand items. `intersection` and `difference` preserve the
left set's order. `subset` tests whether every left-hand item exists on the right.

```el
names = Set.from_list(["Ada", "Grace", "Ada"])
IO.println(Set.to_list(names)) # ["Ada", "Grace"]
IO.println(Set.size(names))    # 2
```
