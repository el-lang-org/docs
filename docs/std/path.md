# Path

`Path` manipulates `/`-separated strings without accessing the filesystem.
It does not resolve symbolic links, Windows drive letters, or backslash
separators. Path-building functions remove repeated and trailing separators.

## Functions

### Path.separator

```el
Path.separator() -> string
```

Returns the path separator, `"/"`.

```el
value = Path.separator() # "/"
```

### Path.is_absolute

```el
Path.is_absolute(path: string) -> bool
```

Returns true when `path` begins with `/`; false for relative paths and for
`""`.

```el
value = Path.is_absolute("/tmp/data.txt") # true
```

### Path.split

```el
Path.split(path: string) -> [string]
```

Returns the non-empty components of `path`, in order. Neither leading nor
repeated nor trailing separators produce empty entries.

```el
value = Path.split("/tmp//data.txt") # ["tmp", "data.txt"]
```

### Path.join

```el
Path.join(base: string, child: string) -> string
```

Joins `base` and `child` with a single `/`, dropping repeated and trailing
separators. When `child` is absolute it replaces `base`. Purely textual.

```el
value = Path.join("/tmp", "data.txt") # "/tmp/data.txt"
```

### Path.normalize

```el
Path.normalize(path: string) -> string
```

Cancels `.` and `..` components of `path` textually, without consulting the
file system. A `..` that would climb above the root of an absolute path is
dropped; a leading `..` of a relative path is kept. Returns `"."` when a
relative path has nothing left.

```el
value = Path.normalize("a/../b") # "b"
```

### Path.basename

```el
Path.basename(path: string) -> string
```

Returns the final component of `path`, or `""` for `"/"` and `""`.

```el
value = Path.basename("/tmp/data.txt") # "data.txt"
```

### Path.dirname

```el
Path.dirname(path: string) -> string
```

Returns `path` without its final component: `"/"` for a top-level absolute
path and `"."` for a bare relative name.

```el
value = Path.dirname("data.txt") # "."
```

### Path.extension

```el
Path.extension(path: string) -> {:some, string} | :none
```

Returns `{:some, ext}` with the text after the last `.` of the basename, or
`:none` when there is none. A leading dot (`.bashrc`) or a trailing one
(`name.`) does not start an extension.

```el
value = Path.extension("data.txt") # {:some, "txt"}
```

`separator` returns `"/"`. `split` returns nonempty components.
An absolute child replaces the base in `join`. `normalize` cancels `.` and
`..` textually; an absolute path cannot rise above `/`, and an empty relative
result becomes `.`.

`basename("/")` is empty. `dirname` returns `/` for a top-level absolute path
and `.` for a bare relative name. A leading or trailing dot does not start an
extension; `extension` returns `:none` when none exists.

```el
IO.println(Path.join("/tmp", "reports/data.txt")) # /tmp/reports/data.txt
IO.println(Path.normalize("a/../b"))              # b
```
