# Strings, bytes, and bitstrings

## Four distinct text types

`string` always contains valid UTF-8. It is distinct from raw `bytes`, arbitrary
length `bits`, and a single Unicode scalar value (`rune`). These operations make
the unit of inspection explicit:

```el
byte_count = String.byte_size(text)
grapheme_count = String.length(text)

for byte in String.bytes(text) do
  inspect_byte(byte)
end

codepoints: [rune] = String.codepoints(text)
graphemes: [string] = String.graphemes(text)

for grapheme in graphemes do
  IO.println(grapheme)
end
```

The plural functions favor direct use and return ordinary eager collections.
Allocation-sensitive traversal uses explicitly named views:

```el
for codepoint in String.codepoint_view(text) do
  inspect_codepoint(codepoint)
end

for grapheme in String.grapheme_view(text) do
  inspect_grapheme(grapheme)
end
```

::: tip
`String.length` counts Unicode grapheme clusters, not bytes or code points.
Integer indexing such as `text[i]` is invalid — EL strings are not indexable.
:::

## Predicates and splitting

Basic predicates and a separator operation make common validation and parsing
intent explicit:

```el
if String.empty(text) == false and String.contains(text, "@") do
  fields: [string] = String.split(text, "@")
end
```

- `String.empty(text)` is equivalent to `String.byte_size(text) == 0`.
- `String.contains(text, pattern)` performs an exact, case-sensitive substring
  search over UTF-8 bytes; the empty pattern is contained in every string.
- `String.split(text, separator)` separates from left to right at exact,
  non-overlapping matches and preserves leading, trailing, and adjacent empty
  fields.

```el
String.split("a,,b,", ",")    # ["a", "", "b", ""]
String.split("abc", "/")      # ["abc"]
String.split("abc", "")       # ["abc"] — empty separator does no split
```

Use `String.graphemes` when the desired unit is a Unicode extended grapheme
cluster rather than a literal separator match.

## Unicode

All grapheme APIs use EL v1's bundled Unicode 17.0.0 data and the untailored
default extended-grapheme rules from UAX #29 revision 47. Results do not depend
on the host locale or installed Unicode libraries, and they do not normalize or
case-fold the source text.

## Building text and binary data

Use `Buffer` to avoid repeated immutable concatenation when building text or
binary data. `Buffer` is a value-semantic growable builder:

```el
mut buffer = Buffer.new()
buffer := Buffer.append_string(buffer, "hello")
buffer := Buffer.append_byte(buffer, 0x20)
buffer := Buffer.append_string(buffer, "world")

match Buffer.to_string(buffer) do
  {:ok, text} -> IO.println(text)
  {:error, reason} ->
    offset = String.utf8_error_offset(reason)
    IO.report("invalid UTF-8 at byte " ++ Show.show(offset))
end
```

- `Buffer.to_bytes` always succeeds.
- `Buffer.to_string` validates UTF-8 and returns a tagged result; `String.Utf8Error`
  identifies the zero-based offset of the first invalid sequence.
- Distinct `append_byte`, `append_bytes`, and `append_string` functions avoid
  overloading, and previously returned values remain unchanged.

## Bytes

`bytes` is raw binary data. `Bytes.byte_size` is O(1), `Bytes.slice` is
bounds-checked and may share immutable backing storage, and `Bytes.from_list` /
`Bytes.to_list` convert between `bytes` and `[u8]` in O(n):

```el
byte_count = Bytes.byte_size(data)
sliced = Bytes.slice(data, 1, 4)
copied_bytes = Bytes.from_list(Bytes.to_list(data))
```

See the [`Bytes`](/std/bytes), [`Bits`](/std/bits), [`String`](/std/string),
and [`Buffer`](/std/buffer) references for the complete function listings.

## Bitstrings

V1 `<<...>>` construction produces `bytes`, and its bitstring patterns consume
`bytes`. Integer segments use literal byte-aligned widths from 8 through 64
bits; byte segments may use a dynamic size measured in bytes:

```el
packet = <<version::unsigned-big-size(8),
  length::unsigned-big-size(16),
  payload::bytes>>

match packet do
  <<version::unsigned-big-size(8),
    length::unsigned-big-size(16),
    payload::bytes-size(usize(length))>> -> process(version, payload)
  _ -> IO.report("invalid packet")
end
```

Construction checks integer ranges and exact sized-byte lengths without
truncation or padding. Integer pattern captures are `u64` when unsigned and
`i64` when signed. Arbitrary-length `bits` remain useful for non-byte-aligned
work:

```el
all: bits = Bytes.to_bits(packet)
header: bits = Bits.slice(all, 0, 12)
first: bool = header[0]

match Bits.to_bytes(header) do
  {:some, data} -> consume(data)
  :none -> IO.report("not byte-aligned")
end
```

`Bits.slice` and indexing are bounds-checked. Bit index zero is the
most-significant bit of the first source byte, and `++` concatenates bit
sequences. Float, UTF, explicit-unit, and non-byte-aligned source segments are
post-v1.
