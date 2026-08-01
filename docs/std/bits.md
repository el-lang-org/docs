# Bits

`bits` is a bit sequence of arbitrary length. It generalizes `bytes` and is
useful for non-byte-aligned work.

## Functions

### Bits.bit_size

```el
Bits.bit_size(value: bits) -> usize
```

Returns the length of the bit sequence in bits:

```el
size = Bits.bit_size(all)   # 12
```

### Bits.slice

```el
Bits.slice(value: bits, start: usize, length: usize) -> bits
```

Returns a view of the bit sequence starting at `start` and spanning `length`
bits. It is bounds-checked — an out-of-bounds range fails with
`index_out_of_bounds` rather than returning an option — and may produce a
non-byte-aligned value:

```el
header: bits = Bits.slice(all, 0, 12)
```

### Bits.to_bytes

```el
Bits.to_bytes(value: bits) -> Option(bytes)
```

Returns the byte-aligned representation. Returns `:none` when the bit length is
not divisible by eight:

```el
match Bits.to_bytes(header) do
  {:some, data} -> consume(data)
  :none -> IO.report("not byte-aligned")
end
```

## Indexing

`bits` supports read indexing by `usize`, returning `bool`. Bit index zero
denotes the most-significant bit of the first source byte:

```el
first: bool = header[0]
```

`++` concatenates bit sequences through the `Concat` protocol.
