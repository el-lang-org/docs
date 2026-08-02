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
String.split(text: string, separator: string) -> [string]
```

Separates from left to right at exact, non-overlapping separator matches. It
preserves leading, trailing, and adjacent empty fields. An empty separator
performs no split and returns a one-element list containing the source:

```el
String.split("a,,b,", ",")   # ["a", "", "b", ""]
String.split("abc", "/")     # ["abc"]
String.split("abc", "")      # ["abc"]
```

Use `String.graphemes` when the desired unit is a Unicode extended grapheme
cluster rather than a literal separator match.

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
String.from_bytes(data: bytes) ->
  {:ok, string} | {:error, String.Utf8Error}
```

Validates the byte sequence as UTF-8:

```el
match String.from_bytes(data) do
  {:ok, text} -> IO.println(text)
  {:error, reason} ->
    offset = String.utf8_error_offset(reason)
    IO.report("invalid UTF-8 at byte " ++ Show.show(offset))
end
```

### String.utf8_error_offset

```el
String.utf8_error_offset(error: String.Utf8Error) -> usize
```

Returns the zero-based byte offset of the first invalid UTF-8 sequence. An
incomplete final sequence reports the offset at which that sequence begins:

```el
offset = String.utf8_error_offset(reason)
```

## Notes

`String.Utf8Error` is an opaque immutable value implementing `Show`, `Eq`, and
`Hash`, but not `Ord`; equality and hashing use only the offset. EL performs no
implicit normalization, case folding, or locale tailoring before segmentation.
The default UAX #29 rules operate directly on the source scalar sequence.
