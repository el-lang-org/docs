# IO and the file system

Garbage collection manages **memory**, not files, sockets, or other scarce
resources. Register deterministic cleanup with `defer`.

For the complete function listings, see the [`IO`](/std/io), [`File`](/std/file),
and [`Process`](/std/process) references.

## File example

```el
match File.open_read(path) do
  {:ok, file} ->
    defer do
      match File.close(file) do
        {:ok, _} -> unit
        {:error, reason} -> IO.report(reason)
      end
    end

    process(file)

  {:error, reason} ->
    IO.report(reason)
end
```

## Console output and recoverable streams

`IO.print`, `IO.println`, and `IO.report` accept any value implementing `Show`;
they format through that protocol and treat console failure as unrecoverable.
This is not a general implicit conversion to `string`. Programs needing
recoverable behavior use the `Reader` and `Writer` protocols with `IO.stdin`,
`IO.stdout`, or `IO.stderr`.

Standard collections use recursive diagnostic formatting. Map keys and values
must both implement `Show`, and map entries retain insertion order:

```el
counts: Map(string, usize) = %{"first" => 1, "second" => 2}
IO.println(counts)
IO.println(["nested", Show.show(#[3, 4])])
```

This prints:

```text
%{first => 1, second => 2}
[nested, #[3, 4]]
```

These forms are intended for human-readable diagnostics, not parsing or stable
serialization.

`File.open_read` returns `File.Reader`; `File.create` and `File.append` return
`File.Writer`. Copying one of these opaque handles aliases the same OS resource.
Closing through one alias invalidates all aliases, and subsequent operations or a
repeated close return tagged errors.

## Portable error recovery

Inspect a stable kind instead of parsing `Show` output or a host error code:

```el
match File.open_read(path) do
  {:ok, file} -> process(file)
  {:error, reason} ->
    match File.error_kind(reason) do
      :not_found -> IO.report("file not found")
      _ -> IO.report(reason)
    end
end
```

`File.error_operation` identifies the failed operation, while
`File.error_code` returns an optional target-dependent `i64`. `IO.Error` exposes
the equivalent accessors through `IO`. Standard I/O, file, and UTF-8 errors are
immutable values implementing `Eq`, `Hash`, and `Show`, but not `Ord`.

## Semantics

- A deferred action is registered **only when execution reaches it**. A deferred
  call evaluates its target and arguments immediately and delays only
  invocation:

  ```el
  defer release(make_handle())
  # make_handle runs now; release runs at scope exit
  ```

- A deferred block captures referenced outer bindings as immutable value
  snapshots and delays its body expressions:

  ```el
  defer do
    release(make_handle())
    # make_handle runs at scope exit
  end
  ```

- Actions run once, in **last-in-first-out** order, on every normal exit from the
  innermost enclosing lexical block — including an early `return`. Loop-body
  actions run at the end of each reached iteration.
- On fallthrough, the block result is evaluated and saved before cleanup, then
  yielded afterward.
- A deferred action must evaluate to `unit`. It cannot use `return`, register
  another `defer`, or update a captured outer binding, though it may use local
  mutable bindings declared inside the deferred block.
- Deferred actions do **not** run after an unrecoverable runtime failure, an
  implementation abort, or external termination.
