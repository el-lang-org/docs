# Random

`Random.Generator` is a persistent splitmix64 generator. Draws return a value
and the next generator, leaving the input unchanged. A fixed seed reproduces
the sequence. This generator provides no cryptographic guarantee.

## Functions

```el
Random.entropy() -> u64
Random.new(seed: u64) -> Random.Generator
Random.from_entropy() -> Random.Generator
Random.next_u64(generator: Random.Generator) -> {u64, Random.Generator}
Random.below(generator: Random.Generator, bound: u64) -> {:some, {u64, Random.Generator}} | :none
Random.pick[A](generator: Random.Generator, items: [A]) -> {:some, {A, Random.Generator}} | :none
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
