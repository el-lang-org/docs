# Random

`Random.Generator` is a persistent splitmix64 generator. Draws return a value
and the next generator, leaving the input unchanged. A fixed seed reproduces
the sequence. This generator provides no cryptographic guarantee.

## Functions

### Random.entropy

```el
Random.entropy() -> u64
```

Returns 64 random bits from the operating system (`getentropy`). If that call
fails, falls back to mixing the wall-clock time, monotonic clock, and process
id, which is less unpredictable. Not a cryptographic guarantee either way.

```el
seed: u64 = Random.entropy()
```

### Random.new

```el
Random.new(seed: u64) -> Random.Generator
```

Returns a generator seeded with `seed`. The same seed always produces the same
sequence of draws.

```el
generator = Random.new(42)
```

### Random.from_entropy

```el
Random.from_entropy() -> Random.Generator
```

Returns a generator seeded from `Random.entropy()`, so each run differs.

```el
generator = Random.from_entropy()
```

### Random.next_u64

```el
Random.next_u64(generator: Random.Generator) -> {u64, Random.Generator}
```

Draws one `u64` and returns `{value, next_generator}`. `generator` is
unchanged; pass `next_generator` to the following draw, or the same value will
repeat.

```el
match Random.next_u64(Random.new(0)) do
	{value, next} -> IO.println(value) # 16294208416658607535
end
```

### Random.below

```el
Random.below(generator: Random.Generator, bound: u64) -> {:some, {u64, Random.Generator}} | :none
```

Draws a value uniformly from `0..bound` (excluding `bound`) without modulo
bias. Returns `{:some, {value, next_generator}}`, or `:none` when `bound` is
0.

```el
match Random.below(Random.new(42), 10) do
	{:some, {value, next}} -> IO.println(value) # 0 through 9
	:none -> IO.report("zero bound")
end
```

### Random.pick

```el
Random.pick[A](generator: Random.Generator, items: [A]) -> {:some, {A, Random.Generator}} | :none
```

Chooses one element of `items` uniformly. Returns `{:some, {item,
next_generator}}`, or `:none` for an empty list.

```el
match Random.pick(Random.new(42), ["red", "blue"]) do
	{:some, {value, next}} -> IO.println(value)
	:none -> IO.report("empty list")
end
```

`entropy` obtains eight bytes from the operating system. If that operation
fails, clocks and the process ID supply a fallback seed. `from_entropy`
constructs a generator with that seed.

`below` samples uniformly from zero inclusive to `bound` exclusive, rejecting
biased remainders. A zero bound returns `:none`. `pick` samples a list item
uniformly, or returns `:none` for an empty list.

```el
generator = Random.new(0)
match Random.next_u64(generator) do
	{value, next} -> IO.println(value) # 16294208416658607535
end
```
