# OS

`OS` reports the platform the runtime was built for. The supported native
target remains Darwin arm64; the other result names do not imply target support.

## Functions

### OS.platform_code

```el
OS.platform_code() -> i64
```

Returns the host code `os * 16 + arch`: os is 1 macOS, 2 Linux, 3 Windows;
arch is 1 arm64, 2 x86_64; other values mean unknown. Prefer `name`, `arch`,
and the `is_*` predicates over decoding this yourself.

```el
value = OS.platform_code() # 17 on Darwin arm64
```

### OS.name

```el
OS.name() -> string
```

Returns the host operating system as `"macos"`, `"linux"`, `"windows"`, or
`"unknown"`.

```el
value = OS.name() # "macos" on Darwin
```

### OS.arch

```el
OS.arch() -> string
```

Returns the host CPU architecture as `"arm64"`, `"x86_64"`, or `"unknown"`.

```el
value = OS.arch() # "arm64" on Darwin arm64
```

### OS.is_windows

```el
OS.is_windows() -> bool
```

Returns true when `OS.name()` is `"windows"`.

```el
value = OS.is_windows() # false on Darwin
```

### OS.is_unix

```el
OS.is_unix() -> bool
```

Returns true on macOS and Linux, the Unix-like hosts; false otherwise.

```el
value = OS.is_unix() # true on Darwin
```

`name` returns `"macos"`, `"linux"`, `"windows"`, or `"unknown"`.
`arch` returns `"arm64"`, `"x86_64"`, or `"unknown"`. `is_unix` recognizes
macOS and Linux.

`platform_code` returns `os * 16 + arch`: OS codes are 1 for macOS, 2 for Linux,
3 for Windows, and 0 for other platforms. Architecture codes are 1 for arm64,
2 for x86_64, and 0 for other architectures.
