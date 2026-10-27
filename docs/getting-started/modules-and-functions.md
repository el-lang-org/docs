# Modules and functions

## Declarations

Named functions use `fn`. Parameter types are explicit, and a block returns its
final expression:

```el
fn add(left: i64, right: i64) -> i64 do
	left + right
end

private fn greet(name: string) do
	IO.println("Hello, #{name}")
end
```

Functions are public by default. `private fn` restricts access to the declaring
module. An omitted return annotation means `unit`. A module cannot declare
the same function name at multiple arities.

## Explicit generics

Declare PascalCase type parameters in square brackets after the function name.
Put protocol bounds on each parameter:

```el
fn maximum[T: Ord](left: T, right: T) -> T do
	if left >= right do left else right end
end

fn describe[T: Show](value: T) -> string do
	"value = #{value}"
end
```

Type applications also use square brackets, such as `Box[i64]` and
`Map[string, i64]`. Use `T: Eq + Hash` to require multiple protocols. Type
variables are never introduced implicitly. Call sites infer type arguments
from values and the expected result; `maximum[i64](1, 2)` is unsupported.

## Function values and closures

Named functions and anonymous functions share the same function types:

```el
fn square(value: i64) -> i64 do
	value * value
end

fn apply(value: i64, callback: (i64) -> i64) -> i64 do
	callback(value)
end

fn demo() do
	IO.println(apply(5, square))
	double = fn value: i64 -> value * 2 end
	IO.println(apply(5, double))
end
```

Anonymous functions use `fn parameters -> body end`, without `do`. Parameter
types may come from an expected callback type or constraints in the body:

```el
minimum: i64 = 10
keep = fn value -> value > minimum end
selected = Enum.filter([5, 15, 20], keep) # [15, 20]
```

`fn value -> value end` needs an annotation or expected function type because
its body does not determine the parameter type. Later calls do not infer the
type of an earlier closure binding.

Closures capture referenced outer values when the closure is created. Captures
are immutable snapshots, including captures of mutable locals:

```el
mut offset: i64 = 1
add_offset = fn value: i64 -> value + offset end
offset := 10
IO.println(add_offset(5)) # 6
```

Closures can escape their defining function. Capturing a resource handle keeps
its existing aliasing behavior. Function values have no `Eq`, `Ord`, `Hash`,
or `Show` implementation.

### Patterns and clauses

Anonymous-function parameters may destructure values. Multiple clauses use
patterns and must cover every possible argument:

```el
sum_pair = fn {left, right}: {i64, i64} -> left + right end

label: (Option[i64]) -> string = fn
	{:some, value} -> "value = #{value}"
	:none -> "missing"
end
```

Guards and named multi-clause functions remain unsupported.

### Capture shorthand

`&(expression)` creates an anonymous function. `&1`, `&2`, and later numbered
arguments supply its parameters:

```el
squares: [i64] = Enum.map([1, 2, 3], &(&1 * &1))
total = Enum.reduce([1, 2, 3], 0, &(&1 + &2))
```

Placeholders start at `&1` and must be contiguous. Partial application syntax
and bound receiver methods remain deferred. Protocol operations such as
`Show.show` need an ordinary wrapper or closure when passed as callbacks.

## Newlines and pipelines

EL has no semicolons. A newline separates complete constructs. A line continues
inside open delimiters, after a comma, after an operator awaiting its right
operand, or before a leading pipeline operator.

```el
result = "ONE TWO"
	|> String.downcase
	|> String.split(" ")
	|> Enum.frequencies
	|> IO.inspect
```

`|>` inserts its left value as the first argument of its right-hand call.
`value |> transform(a, b)` means `transform(value, a, b)`. A bare target such
as `value |> transform` means `transform(value)`. Pipelines associate left to
right and require statically resolvable targets.

In multiline pipelines, `|>` begins each continued line after indentation,
and its right operand starts on that line. Other operators cannot continue a
complete expression from the preceding line.

## One module per file

Each source file starts with one `module` header. The file provides the module
boundary, so the header takes neither `do` nor `end`:

```el
module Geometry

fn square(value: i64) -> i64 do
	value * value
end
```

| Source path | Header | With namespace `Example` |
| --- | --- | --- |
| `src/main.ell` | `module Main` | `Example.Main` |
| `src/web/client.ell` | `module Web.Client` | `Example.Web.Client` |
| `src/json_api.ell` | `module JsonApi` | `Example.JsonApi` |
| `src/foo/index.ell` | `module Foo.Index` | `Example.Foo.Index` |

Path components use lowercase `snake_case` and convert to `PascalCase`.
Acronyms and `index.ell` receive no special treatment.

## Name resolution and visibility

EL has no imports or module aliases. Current-module functions use bare names;
other modules use qualified names:

```el
validate(value)              # current module
Web.Client.get(url)          # current package
Parser.Decoder.decode(input) # dependency whose namespace is Parser
IO.println(message)          # core prelude
```

Bare names resolve through lexical scope, the current module, and the fixed
prelude. A local binding shadows a bare function name. Qualified public names
remain available. Every package in a resolved graph has a distinct root namespace.

Prelude roots such as `Json`, `Math`, `Net`, and `Http` are reserved against
package declarations and dependency root namespaces. The prelude provides
qualified functions, with no bare function imports.

Structs, aliases, protocols, implementations, and ordinary struct fields are
public. Opaque resource structs hide their fields and construction.

## Comments

`#` starts a line comment except when it begins `#[` or `#|`. Block comments
use `#| ... |#` and may nest:

```el
# A line comment.
#| An outer comment.
	#| A nested comment. |#
|#
```
