# Assert

Assertions return `Assert.Result = :ok | {:error, string}`. Failures are values;
`with` stops at the first failed assertion.

## Functions

### Assert.pass

```el
Assert.pass() -> Assert.Result
```

Returns `:ok`. Use it as the final result of a test that has no assertions
left to make.

```el
result = Assert.pass() # :ok
```

### Assert.fail

```el
Assert.fail(message: string) -> Assert.Result
```

Returns `{:error, message}`, an unconditional failed assertion. `message` is
reported as written.

```el
result = Assert.fail("expected a positive count") # {:error, "expected a positive count"}
```

### Assert.that

```el
Assert.that(condition: bool, message: string) -> Assert.Result
```

Passes (`:ok`) when `condition` is true; otherwise returns `{:error,
message}`. `message` is the text reported on failure.

```el
result = Assert.that(3 > 0, "count must be positive") # :ok
```

### Assert.equal

```el
Assert.equal[A: Eq + Show](left: A, right: A) -> Assert.Result
```

Returns `:ok` when `left == right`. Otherwise returns an error message with
both values rendered through `Show` and separated by `!=`.

```el
result = Assert.equal(2 + 2, 4) # :ok
```

### Assert.not_equal

```el
Assert.not_equal[A: Eq + Show](left: A, right: A) -> Assert.Result
```

Returns `:ok` when `left != right`. Otherwise returns an error message with
both values rendered through `Show` and separated by `==`.

```el
result = Assert.not_equal("open", "closed") # :ok
```

## Tests

The [test command](/getting-started/cli#el-test) discovers public `test_*`
functions without parameters in package source modules. Each returns
`Assert.Result`:

```el
module Checks

# Checks integer addition and a positive comparison, returning the first failure.
fn test_arithmetic() -> Assert.Result do
	with :ok <- Assert.equal(1 + 1, 2),
		:ok <- Assert.that(2 > 1, "two exceeds one") do
		:ok
	end
end
```

`el test --timeout 10 test_arithmetic` runs this test in its own process.
