# Set

`Set.Set[A]` is an immutable insertion-ordered set backed by `Map[A, bool]`.
Every operation requires `A: Eq + Hash`. Updates return a new set and leave the
original usable. Adding an existing item preserves its position.

## Functions

```el
Set.new[A: Eq + Hash]() -> Set.Set[A]
Set.put[A: Eq + Hash](set: Set.Set[A], item: A) -> Set.Set[A]
Set.remove[A: Eq + Hash](set: Set.Set[A], item: A) -> Set.Set[A]
Set.contains[A: Eq + Hash](set: Set.Set[A], item: A) -> bool
Set.size[A: Eq + Hash](set: Set.Set[A]) -> usize
Set.to_list[A: Eq + Hash](set: Set.Set[A]) -> [A]
Set.from_list[A: Eq + Hash](items: [A]) -> Set.Set[A]
Set.union[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
Set.intersection[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
Set.difference[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> Set.Set[A]
Set.subset[A: Eq + Hash](left: Set.Set[A], right: Set.Set[A]) -> bool
```

`to_list` follows insertion order. `union` starts with the left set's order and
appends new right-hand items. `intersection` and `difference` preserve the
left set's order. `subset` tests whether every left-hand item exists on the right.

```el
names = Set.from_list(["Ada", "Grace", "Ada"])
IO.println(Set.to_list(names)) # [Ada, Grace]
IO.println(Set.size(names))    # 2
```
