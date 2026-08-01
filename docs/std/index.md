# Standard Library

The core standard library ships as a fixed set of prelude modules. Their names
are reserved against package declarations and dependency root namespaces, and
they are referenced with qualified names; the prelude imports no bare
functions.

```text
Array Bits Buffer Bytes Enum File IO List Map Process Rune Slice String
I8 I16 I32 I64 Isize U8 U16 U32 U64 Usize
```

- **Collection modules** — [Array](/std/array), [Bits](/std/bits),
  [Bytes](/std/bytes), [Enum](/std/enum),
  [List](/std/list), [Map](/std/map), [Slice](/std/slice)
- **Text modules** — [Buffer](/std/buffer), [Rune](/std/rune),
  [String](/std/string)
- **I/O and process modules** — [File](/std/file), [IO](/std/io),
  [Process](/std/process)
- **Numeric conversions** — [I8 I16 I32 I64 Isize U8 U16 U32 U64
  Usize](/std/numeric)

The protocol names `Eq`, `Ord`, `Show`, `Hash`, `Iterable`, `Reader`, `Writer`,
and `Concat` define operations, not library modules; see
[Protocols](/getting-started/protocols).
