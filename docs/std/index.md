# Standard library

The compiler supplies prelude modules and embeds the EL sources in `stdlib/`.
Module roots are reserved against package declarations and dependency root
namespaces. Functions use qualified names; the prelude imports no bare functions.

Reference signatures display type parameters and bounds, such as
`Math.abs[T: Number](x: T) -> T`. Calls infer their type arguments:
`Math.abs(-3)`. Signature notation is not expression syntax.

## Collections

- [Array](/std/array), [List](/std/list), [Slice](/std/slice), and [Map](/std/map)
- [Set](/std/set), [Queue](/std/queue), and [Heap](/std/heap)
- [Enum](/std/enum) for generic traversal and callbacks

## Text and binary data

- [String](/std/string), [Rune](/std/rune), and [Buffer](/std/buffer)
- [Bytes](/std/bytes) and [Bits](/std/bits)
- [Format](/std/format) for padding and float precision
- [Json](/std/json) for parsed JSON documents

## I/O and networking

- [IO](/std/io), [File](/std/file), and [ANSI](/std/ansi)
- [Net](/std/net) for TCP listeners and TCP or TLS client streams
- [Http](/std/http) for HTTP/1.1 clients, messages, and sequential servers
- [Native FFI](/std/ffi) for explicitly opted-in C calls and foreign memory

## Numbers and system services

- [Math](/std/math) and [numeric conversions](/std/numeric)
- [Time](/std/time) and [Random](/std/random)
- [Process](/std/process), [OS](/std/os), and [Path](/std/path)
- [Log](/std/log) and [Assert](/std/assert)

Core protocols define static operations. See [Protocols](/getting-started/protocols)
and [Operators](/getting-started/operators) for arithmetic and Unicode infix dispatch.
