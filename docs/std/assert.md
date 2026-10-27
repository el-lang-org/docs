# Assert

Assertions return `Assert.Result = :ok | {:error, string}`. Failures are values;
`with` stops at the first failed assertion.

## Functions

```el
Assert.pass() -> Assert.Result
Assert.fail(message: string) -> Assert.Result
Assert.that(condition: bool, message: string) -> Assert.Result
Assert.equal[A: Eq + Show](left: A, right: A) -> Assert.Result
Assert.not_equal[A: Eq + Show](left: A, right: A) -> Assert.Result
```

`pass` returns `:ok`; `fail` returns the supplied message. `that` succeeds when
its condition is true. `equal` and `not_equal` require both `Eq` and `Show` and
include both values in a failure message, such as `"1 != 2"`.

## Tests

The [test command](/getting-started/cli#el-test) discovers public `test_*`
functions without parameters in package source modules. Each returns
`Assert.Result`:

```el
module Checks

fn test_arithmetic() -> Assert.Result do
	with :ok <- Assert.equal(1 + 1, 2),
		:ok <- Assert.that(2 > 1, "two exceeds one") do
		:ok
	end
end
```

`el test --timeout 10 test_arithmetic` runs this test in its own process.
