# String

`string` always contains valid UTF-8. Integer indexing is not supported; use
these functions instead.

## Functions

### String.byte_size

```el
String.byte_size(text: string) -> usize
```

Returns the number of bytes in the UTF-8 encoding. It is O(1):

```el
count = String.byte_size("hellö")   # 6
```

### String.length

```el
String.length(text: string) -> usize
```

Returns the number of Unicode grapheme clusters. It is generally O(n):

```el
count = String.length("hellö")   # 5
```

### String.empty

```el
String.empty(text: string) -> bool
```

Returns `true` when the string has no bytes. It is equivalent to
`String.byte_size(text) == 0`:

```el
String.empty("")     # true
String.empty("a")    # false
```

### String.downcase

```el
String.downcase(text: string) -> string
```

Returns the text with each Unicode scalar value mapped by the pinned Unicode
lowercase mapping. It is independent of the host locale and performs no case
folding or normalization:

```el
String.downcase("CAFÉ")     # "café"
String.downcase("Hello")    # "hello"
```

### String.contains

```el
String.contains(text: string, pattern: string) -> bool
```

Performs an exact, case-sensitive substring search over UTF-8 bytes. The empty
pattern is contained in every string:

```el
String.contains("café", "fé")   # true
String.contains("abc", "")      # true
String.contains("abc", "z")     # false
```

### String.split

```el
String.split(text: string, separator: string = " ") -> [string]
```

Separates from left to right at exact, non-overlapping separator matches. It
preserves leading, trailing, and adjacent empty fields. The separator defaults
to a single ASCII space, so `String.split("one two")` returns `["one", "two"]`.
An empty separator performs no split and returns a one-element list containing
the source:

```el
String.split("a,,b,", ",")   # ["a", "", "b", ""]
String.split("abc", "/")     # ["abc"]
String.split("abc", "")      # ["abc"]
String.split("one two")      # ["one", "two"]
```

### String.replace

```el
String.replace(text: string, pattern: string, replacement: string) -> string
```

Consumes exact, non-overlapping UTF-8 matches from left to right, replacing each
with `replacement`. An empty pattern is a no-op and leaves the source unchanged:

```el
String.replace("a,b,c", ",", "-")   # "a-b-c"
String.replace("aaa", "aa", "b")    # "ba" — non-overlapping, left to right
String.replace("abc", "", "-")      # "abc"
```

Use `String.graphemes` when the desired unit is a Unicode extended grapheme
cluster rather than a literal separator match.

### String.to_integer

```el
String.to_integer(text: string, base: i64) ->
	{:ok, i64} | {:error, String.ToIntegerErrorReason, string}
```

Converts all of `text` to an `i64`. `base` must be an `i64` between 2 and 36.
A direct call may omit it to use base 10. The input remains unchanged.

```el
String.to_integer("42")      # {:ok, 42}
String.to_integer("-2A", 16) # {:ok, -42}
"101" |> String.to_integer(2) # {:ok, 5}
```

Uses the signed ASCII digit rules of [Integer.parse](/std/integer#integer-parse).
Whitespace, underscores, and trailing text are invalid. Radix prefixes receive
no special treatment.
`String.ToIntegerErrorReason` is
`:invalid_base | :invalid_integer | :out_of_range`.

Checks the base first, then complete syntax, then range. Trailing text returns
`:invalid_integer` even when the numeric prefix would overflow.
A syntactically valid value outside `i64` returns `:out_of_range`.
Messages describe failures without copying the input and are not a stable
machine format. Invalid text returns an error value without terminating the actor.

```el
match String.to_integer("42kg") do
	{:ok, value} -> IO.println(value)
	{:error, :invalid_integer, _} -> IO.report("expected a whole integer")
	{:error, _, message} -> IO.report(message)
end
```

Function values keep the declared two-argument type. For a one-argument decimal
callback, use `fn text: string -> String.to_integer(text) end`.

### String.to_float

```el
String.to_float(text: string) ->
	{:ok, f64} | {:error, String.ToFloatErrorReason, string}
```

Converts all of `text` to an `f64`. Requires ASCII digits on both sides of a
decimal point, with an optional leading sign and optional complete exponent.
The input remains unchanged. Unlike [Float.parse](/std/float#float-parse),
integer-looking text and exponent-only forms such as `1e3` are invalid.

```el
String.to_float("1.25e2") # {:ok, 125.0}
String.to_float("-0.5")   # {:ok, -0.5}

match String.to_float("12") do
	{:ok, value} -> IO.println(Format.float(value, 1))
	{:error, :invalid_float, _} -> IO.report("expected a decimal point")
	{:error, :out_of_range, message} -> IO.report(message)
end
```

`String.ToFloatErrorReason` is `:invalid_float | :out_of_range`.
Invalid syntax or trailing text returns `:invalid_float` before any range
check. Whitespace, nonfinite spellings, `.5`, and `1.` are invalid.
A complete value that rounds to infinity returns `:out_of_range`.

Rounding follows [Float.parse](/std/float#float-parse), including finite
subnormals and underflow to signed zero. Invalid text returns an error value
without terminating the actor. Messages describe failures without copying the
input and are not a stable machine format.

### String.bytes

```el
String.bytes(text: string) -> bytes
```

Returns the first-class immutable UTF-8 byte sequence. It may share the
string's immutable storage:

```el
data = String.bytes(text)
```

### String.codepoints

```el
String.codepoints(text: string) -> [rune]
```

Eagerly returns Unicode scalar values in source order:

```el
codepoints: [rune] = String.codepoints(text)
```

### String.graphemes

```el
String.graphemes(text: string) -> [string]
```

Eagerly returns one valid string per extended Unicode grapheme cluster in source
order. Returned strings may share immutable source storage:

```el
graphemes: [string] = String.graphemes(text)
```

### String.codepoint_view

```el
String.codepoint_view(text: string) -> String.CodepointView
```

Lazily iterates `rune` values for allocation-sensitive or early-terminating
traversal:

```el
for codepoint in String.codepoint_view(text) do
	inspect_codepoint(codepoint)
end
```

### String.grapheme_view

```el
String.grapheme_view(text: string) -> String.GraphemeView
```

Lazily iterates grapheme-cluster string slices:

```el
for grapheme in String.grapheme_view(text) do
	inspect_grapheme(grapheme)
end
```

### String.from_bytes

```el
String.from_bytes(data: bytes) -> {:ok, string} | {:error, :invalid_utf8, string}
```

Validates the byte sequence as UTF-8:

```el
match String.from_bytes(data) do
	{:ok, text} -> IO.println(text)
	{:error, :invalid_utf8, message} -> IO.report(message)
end
```

An invalid sequence returns a human-readable message with its zero-based byte
offset. An incomplete final sequence reports where that sequence begins. The
message wording can change; the byte offset has no separate public accessor.

## Notes

EL performs no implicit normalization, case folding, or locale tailoring before
segmentation. `downcase` uses the pinned Unicode scalar mappings. `replace`
matches exact UTF-8 bytes. Both are independent of the host locale. The default
UAX #29 rules operate directly on the source scalar sequence.
