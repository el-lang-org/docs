# OS

`OS` reports the platform the runtime was built for. The supported native
target remains Darwin arm64; the other result names do not imply target support.

## Functions

```el
OS.platform_code() -> i64
OS.name() -> string
OS.arch() -> string
OS.is_windows() -> bool
OS.is_unix() -> bool
```

`name` returns `"macos"`, `"linux"`, `"windows"`, or `"unknown"`.
`arch` returns `"arm64"`, `"x86_64"`, or `"unknown"`. `is_unix` recognizes
macOS and Linux.

`platform_code` returns `os * 16 + arch`: OS codes are 1 for macOS, 2 for Linux,
3 for Windows, and 0 for other platforms. Architecture codes are 1 for arm64,
2 for x86_64, and 0 for other architectures.
