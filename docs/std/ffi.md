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

```el
Ffi.alloc(size: usize) -> Ffi.Memory
Ffi.free(memory: Ffi.Memory) -> unit
Ffi.size(memory: Ffi.Memory) -> usize
Ffi.read_bytes(memory: Ffi.Memory, offset: usize, size: usize) -> bytes
Ffi.write_bytes(memory: Ffi.Memory, offset: usize, data: bytes) -> unit
Ffi.cstring(text: string) -> {:ok, Ffi.Memory} | {:error, :interior_nul}
Ffi.read_cstring(pointer: Ffi.Pointer, limit: usize) -> bytes
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
