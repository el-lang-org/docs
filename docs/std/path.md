# Path

`Path` manipulates `/`-separated strings without accessing the filesystem.
It does not resolve symbolic links, Windows drive letters, or backslash
separators. Path-building functions remove repeated and trailing separators.

## Functions

```el
Path.separator() -> string
Path.is_absolute(path: string) -> bool
Path.split(path: string) -> [string]
Path.join(base: string, child: string) -> string
Path.normalize(path: string) -> string
Path.basename(path: string) -> string
Path.dirname(path: string) -> string
Path.extension(path: string) -> {:some, string} | :none
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
