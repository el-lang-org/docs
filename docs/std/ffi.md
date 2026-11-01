# Native FFI

Opted-in packages can call fixed-arity C functions. Aggregate layout and the EL
ABI remain private. The standalone `elc` compiler has no native opt-in.

## Enable native calls

Add `[native]` to the package manifest. An empty table enables libc bindings;
additional libraries and frameworks use linker names:

```toml
[native]
libraries = ["z"]
frameworks = []
allow = []
```

`libraries`, `frameworks`, `allow`, and `isolated` are the accepted keys.
Each is a same-line array of quoted strings. Missing arrays are empty, and duplicates have no effect.
Linker names cannot contain whitespace, control characters, or path separators,
or start with `-` or `@`.

The root package must list every direct or transitive dependency declaring
`@extern` in its own `[native].allow`. Entries are package IDs. A dependency's
allowlist cannot grant the root's consent. Successful checks and builds report
foreign-declaring packages on standard error as `native FFI: <package-id>`.

## Declare a foreign function

`@extern["symbol"]` precedes a bodiless `fn` or `private fn` signature on the
next line. It takes no generic parameters, `do`, or `end`:

```el
module Main

@extern["strlen"]
private fn strlen(text: Ffi.Memory) -> usize

# Prints the byte length of a NUL-terminated copy of "EL", then frees it.
fn main() do
	match Ffi.cstring("EL") do
		{:ok, text} ->
			defer do Ffi.free(text) end
			IO.println(strlen(text))
		{:error, :interior_nul} -> IO.report("interior NUL")
	end
end
```

In a package with `[native]`, this prints `2`. The runnable
[native FFI example](https://github.com/el-lang-org/el/tree/main/examples/native_ffi)
also links libz and checks a CRC.

## Boundary types

Fixed-width integers, `isize`, `usize`, `f32`, `f64`, and `bool` cross in either
direction. C booleans use `uint8_t`; invalid result values fail conversion.
`unit` results map to C `void`. Opaque `Ffi.Pointer` may be an argument or result;
it cannot be dereferenced, compared, or used in arithmetic.

A `string` or `bytes` argument expands into a borrowed data pointer followed
by its byte length. It is not a NUL-terminated C string. `Ffi.Memory` arguments
pass the first byte of a live native allocation. Strings, bytes, and Memory
cannot be foreign results. Other aggregate types are unsupported.

`@extern["symbol", :errno]` requires an EL result `{T, i32}`. The C function
returns only `T`; EL captures errno in the second field. The pair is not a C
aggregate return value.

Foreign callees must not enter EL, allocate managed data, or retain borrowed
managed pointers, including by returning them. Callbacks, variadic functions,
C header import, foreign-thread entry, dynamic loading, and EL exports are not
supported. Symbols beginning `__el_` remain reserved for the embedded prelude.

## Foreign memory

### Ffi.alloc

```el
Ffi.alloc(size: usize) -> Ffi.Memory
```

Allocates `size` zero-initialized native bytes owned by the calling actor.
The allocation has a fixed size and must be released with `Ffi.free`.
Allocation exhaustion is unrecoverable.

```el
memory = Ffi.alloc(16)
defer do Ffi.free(memory) end
```

### Ffi.free

```el
Ffi.free(memory: Ffi.Memory) -> unit
```

Releases `memory` in its owning actor. Every alias becomes invalid.
A double free, use after free, or access from a different actor fails at
runtime. Returns `unit`.

```el
memory = Ffi.alloc(16)
Ffi.free(memory)
```

### Ffi.size

```el
Ffi.size(memory: Ffi.Memory) -> usize
```

Returns the fixed allocation size of live `memory` in bytes. The caller
must own the allocation; freed memory is invalid.

```el
memory = Ffi.alloc(16)
defer do Ffi.free(memory) end
size = Ffi.size(memory) # 16
```

### Ffi.read_bytes

```el
Ffi.read_bytes(memory: Ffi.Memory, offset: usize, size: usize) -> bytes
```

Copies `size` bytes starting at byte `offset` into immutable managed
`bytes`. The range must fit inside a live allocation owned by the caller;
invalid ranges fail with `foreign_memory`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
data = Ffi.read_bytes(memory, 0, 4)
```

### Ffi.write_bytes

```el
Ffi.write_bytes(memory: Ffi.Memory, offset: usize, data: bytes) -> unit
```

Copies every byte of `data` into `memory` starting at byte `offset`.
The range must fit inside a live allocation owned by the caller. Invalid
ranges fail with `foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
Ffi.write_bytes(memory, 0, String.bytes("EL"))
```

### Ffi.cstring

```el
Ffi.cstring(text: string) -> {:ok, Ffi.Memory} | {:error, :interior_nul}
```

Copies `text` into a new NUL-terminated foreign buffer and returns `{:ok,
memory}`. Returns `{:error, :interior_nul}` when `text` contains a NUL
character (U+0000), since C would see a truncated string. The caller owns the
buffer and releases it with `Ffi.free`.

```el
match Ffi.cstring("EL") do
	{:ok, memory} ->
		defer do Ffi.free(memory) end
		IO.println(Ffi.size(memory)) # 3, including the terminal NUL
	{:error, :interior_nul} -> IO.report("interior NUL")
end
```

### Ffi.read_cstring

```el
Ffi.read_cstring(pointer: Ffi.Pointer, limit: usize) -> bytes
```

Copies bytes from a native `pointer` until NUL or `limit`, whichever
comes first. The caller must supply a valid readable range. A null pointer is
valid only when `limit` is zero. Tagged pointers read from their isolated FFI
helper and must belong to its current generation.

```el
module Main

@extern["strerror"]
private fn strerror(code: i32) -> Ffi.Pointer

# Copies the native error description for code zero into managed bytes.
fn main() do
	data = Ffi.read_cstring(strerror(0), 4096)
	IO.println(Bytes.byte_size(data))
end
```

Storage is fixed-size and zero-initialized. Copies alias one allocation, and
only `free` releases it. `cstring` rejects interior NUL and appends a terminal
NUL. `read_cstring` copies bytes until NUL or the limit; the caller supplies a
valid native range. A null pointer is valid only when the limit is zero.

For each of `i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, and `f64`,
`Ffi.read_T(memory, offset)` returns `T`, and
`Ffi.write_T(memory, offset, value)` writes it. Offsets are `usize`; operations
use native byte order and allow unaligned access. Bounds violations, use after
free, and double free fail with `foreign_memory` at the call's source span.
`Ffi.Memory` and `Ffi.Pointer` are actor-owned and do not implement `Send`.
Access from another actor fails with `not_owner`. Allocate and free Memory in
its owning actor, and use Pointer in the actor that obtained it. Neither type
implements other standard protocols.

## Isolate a native library

Add a library to both `libraries` and `isolated` to run its user-declared
foreign calls in a helper process:

```toml
[native]
libraries = ["z"]
isolated = ["z"]
```

Every isolated entry must also appear in the same table's `libraries`.
Frameworks cannot be isolated. If any package isolates a library, that choice
applies to the whole dependency graph. Prelude and libc calls stay in process.

`el build` and `el test` also produce `<program>-ffi-helper` beside the program.
The host C compiler builds it, honoring `CC`. Copy the program and helper
together. The runtime starts the helper on the first isolated call and reuses
it. Calls park their actor while they wait. The helper executes one call at a
time, with up to eight calls in flight; other callers wait for a slot.

Isolated calls use the same declarations and boundary types, with these limits:

- Borrowed `string` and `bytes` are copied. A native write to those copies
  does not change EL values.
- An entire `Ffi.Memory` block is copied in and back out after a successful
  call. The callee cannot retain its pointer.
- A call carries at most 16 MiB of borrowed content, eight integer-class
  register arguments, and eight floating-point register arguments. A string
  or byte argument uses two integer-class registers.
- `Ffi.Pointer` results refer to helper memory. `Ffi.read_cstring` reads that
  memory through the helper. A pointer from an earlier helper generation, or
  one passed between isolated and in-process calls, fails with `foreign_memory`.
- `:errno` declarations capture errno inside the helper.

A helper crash ends each actor waiting on it with `{:foreign_crash, signal}`.
A crash while `main` waits ends the program. Monitor
[Actor.foreign_helper](/std/actor#isolated-foreign-helper) to observe the crash.
The next call starts a fresh helper, which loses the crashed library's state.
Isolation adds process communication and copies, so reserve it for libraries
whose crashes need containment.

## Scalar memory access

### Ffi.read_i8

```el
Ffi.read_i8(memory: Ffi.Memory, offset: usize) -> i8
```

Reads a i8 from byte `offset` using native byte order. The caller
must own live `memory`, and the 1-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(1)
defer do Ffi.free(memory) end
Ffi.write_i8(memory, 0, 3)
value = Ffi.read_i8(memory, 0) # 3
```

### Ffi.write_i8

```el
Ffi.write_i8(memory: Ffi.Memory, offset: usize, value: i8) -> unit
```

Writes `value` as a i8 at byte `offset` using native byte order.
The caller must own live `memory`, and the 1-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(1)
defer do Ffi.free(memory) end
Ffi.write_i8(memory, 0, 3)
```

### Ffi.read_u8

```el
Ffi.read_u8(memory: Ffi.Memory, offset: usize) -> u8
```

Reads a u8 from byte `offset` using native byte order. The caller
must own live `memory`, and the 1-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(1)
defer do Ffi.free(memory) end
Ffi.write_u8(memory, 0, 3)
value = Ffi.read_u8(memory, 0) # 3
```

### Ffi.write_u8

```el
Ffi.write_u8(memory: Ffi.Memory, offset: usize, value: u8) -> unit
```

Writes `value` as a u8 at byte `offset` using native byte order.
The caller must own live `memory`, and the 1-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(1)
defer do Ffi.free(memory) end
Ffi.write_u8(memory, 0, 3)
```

### Ffi.read_i16

```el
Ffi.read_i16(memory: Ffi.Memory, offset: usize) -> i16
```

Reads a i16 from byte `offset` using native byte order. The caller
must own live `memory`, and the 2-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(2)
defer do Ffi.free(memory) end
Ffi.write_i16(memory, 0, 3)
value = Ffi.read_i16(memory, 0) # 3
```

### Ffi.write_i16

```el
Ffi.write_i16(memory: Ffi.Memory, offset: usize, value: i16) -> unit
```

Writes `value` as a i16 at byte `offset` using native byte order.
The caller must own live `memory`, and the 2-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(2)
defer do Ffi.free(memory) end
Ffi.write_i16(memory, 0, 3)
```

### Ffi.read_u16

```el
Ffi.read_u16(memory: Ffi.Memory, offset: usize) -> u16
```

Reads a u16 from byte `offset` using native byte order. The caller
must own live `memory`, and the 2-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(2)
defer do Ffi.free(memory) end
Ffi.write_u16(memory, 0, 3)
value = Ffi.read_u16(memory, 0) # 3
```

### Ffi.write_u16

```el
Ffi.write_u16(memory: Ffi.Memory, offset: usize, value: u16) -> unit
```

Writes `value` as a u16 at byte `offset` using native byte order.
The caller must own live `memory`, and the 2-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(2)
defer do Ffi.free(memory) end
Ffi.write_u16(memory, 0, 3)
```

### Ffi.read_i32

```el
Ffi.read_i32(memory: Ffi.Memory, offset: usize) -> i32
```

Reads a i32 from byte `offset` using native byte order. The caller
must own live `memory`, and the 4-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
Ffi.write_i32(memory, 0, 3)
value = Ffi.read_i32(memory, 0) # 3
```

### Ffi.write_i32

```el
Ffi.write_i32(memory: Ffi.Memory, offset: usize, value: i32) -> unit
```

Writes `value` as a i32 at byte `offset` using native byte order.
The caller must own live `memory`, and the 4-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
Ffi.write_i32(memory, 0, 3)
```

### Ffi.read_u32

```el
Ffi.read_u32(memory: Ffi.Memory, offset: usize) -> u32
```

Reads a u32 from byte `offset` using native byte order. The caller
must own live `memory`, and the 4-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
Ffi.write_u32(memory, 0, 3)
value = Ffi.read_u32(memory, 0) # 3
```

### Ffi.write_u32

```el
Ffi.write_u32(memory: Ffi.Memory, offset: usize, value: u32) -> unit
```

Writes `value` as a u32 at byte `offset` using native byte order.
The caller must own live `memory`, and the 4-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(4)
defer do Ffi.free(memory) end
Ffi.write_u32(memory, 0, 3)
```

### Ffi.read_i64

```el
Ffi.read_i64(memory: Ffi.Memory, offset: usize) -> i64
```

Reads a i64 from byte `offset` using native byte order. The caller
must own live `memory`, and the 8-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_i64(memory, 0, 3)
value = Ffi.read_i64(memory, 0) # 3
```

### Ffi.write_i64

```el
Ffi.write_i64(memory: Ffi.Memory, offset: usize, value: i64) -> unit
```

Writes `value` as a i64 at byte `offset` using native byte order.
The caller must own live `memory`, and the 8-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_i64(memory, 0, 3)
```

### Ffi.read_u64

```el
Ffi.read_u64(memory: Ffi.Memory, offset: usize) -> u64
```

Reads a u64 from byte `offset` using native byte order. The caller
must own live `memory`, and the 8-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_u64(memory, 0, 3)
value = Ffi.read_u64(memory, 0) # 3
```

### Ffi.write_u64

```el
Ffi.write_u64(memory: Ffi.Memory, offset: usize, value: u64) -> unit
```

Writes `value` as a u64 at byte `offset` using native byte order.
The caller must own live `memory`, and the 8-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_u64(memory, 0, 3)
```

### Ffi.read_f64

```el
Ffi.read_f64(memory: Ffi.Memory, offset: usize) -> f64
```

Reads a f64 from byte `offset` using native byte order. The caller
must own live `memory`, and the 8-byte range must fit. Unaligned access
is allowed. Invalid ranges or freed memory fail with `foreign_memory`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_f64(memory, 0, 3.5)
value = Ffi.read_f64(memory, 0) # 3.5
```

### Ffi.write_f64

```el
Ffi.write_f64(memory: Ffi.Memory, offset: usize, value: f64) -> unit
```

Writes `value` as a f64 at byte `offset` using native byte order.
The caller must own live `memory`, and the 8-byte range must fit.
Unaligned access is allowed. Invalid ranges or freed memory fail with
`foreign_memory`. Returns `unit`.

```el
memory = Ffi.alloc(8)
defer do Ffi.free(memory) end
Ffi.write_f64(memory, 0, 3.5)
```
