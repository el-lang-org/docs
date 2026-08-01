# Bytes

`bytes` is a raw, byte-aligned sequence. It carries no text-encoding promise.

## Functions

### Bytes.byte_size

```el
Bytes.byte_size(values: bytes) -> usize
```

Returns the number of bytes. It is O(1):

```el
count = Bytes.byte_size(data)
```

### Bytes.slice

```el
Bytes.slice(values: bytes, start: usize, length: usize) -> bytes
```

Returns a view of the sequence starting at `start` with `length` bytes. It is
bounds-checked and may share immutable backing storage:

```el
sliced = Bytes.slice(data, 1, 4)
```

### Bytes.from_list

```el
Bytes.from_list(values: [u8]) -> bytes
```

Builds `bytes` from a list of bytes:

```el
copied = Bytes.from_list(Bytes.to_list(data))
```

### Bytes.to_list

```el
Bytes.to_list(values: bytes) -> [u8]
```

Returns the bytes as a list. It is O(n) and allocates a fresh list:

```el
byte_list: [u8] = Bytes.to_list(data)
```

### Bytes.to_bits

```el
Bytes.to_bits(data: bytes) -> bits
```

Returns the same sequence as `bits`. It is lossless:

```el
all: bits = Bytes.to_bits(data)
```

## Indexing

`bytes` supports bounds-checked read indexing by `usize`, returning `u8`. An
out-of-bounds index is an unrecoverable runtime failure:

```el
byte = data[byte_index]
```
