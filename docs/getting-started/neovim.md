# Write EL in Neovim

The bundled plugin detects `.ell` files and connects Neovim 0.11+ to `el lsp`.
It provides diagnostics for unsaved buffers, name completion, document
formatting, and declared function-signature hover.

## Build the server

From your EL checkout, build the compiler without LLVM:

```sh
cargo build --release -p el-cli --bin el
```

See [Build from source](/contributing/building) for toolchain requirements.
The server command is `target/release/el lsp`. `lsp` must be its only argument.

## Install the plugin

Add these lines to `init.lua`. Replace `/path/to/el` with your checkout's
absolute path:

```lua
vim.opt.runtimepath:append("/path/to/el/editors/nvim")
vim.lsp.config("el", {
	cmd = { "/path/to/el/target/release/el", "lsp" },
})
vim.lsp.enable("el")
```

If `el` is already on your `PATH`, omit the `vim.lsp.config` call.
The plugin needs no other plugins.

Restart Neovim and open a `.ell` file. Project files share one server rooted at
`el.toml`. Files outside a project use their own directory as the root.
A loose file, or a file beneath a project that fails to load, still receives
its own parser, resolver, and type diagnostics. Completion and hover require a
loadable project. Formatting also works on standalone files.

## Check diagnostics

In a `.ell` buffer, enter:

```el
module Main

# Returns status zero after the unknown-value error is corrected.
fn main() -> i32 do
	missing
	0
end
```

The editor reports ``E2107: unknown value `missing` ``. Delete the `missing`
line to clear the error without saving.

Open the diagnostic float or location list:

```vim
:lua vim.diagnostic.open_float()
:lua vim.diagnostic.setloclist()
```

The float retains notes and help. Related project and dependency declarations
use real-file locations when the client supports them. Embedded standard-library
locations appear as text, for example `stdlib/string.ell:line:column`.

Independent syntax errors remain visible until you fix them. A missing `do`
after a valid `match` subject points at `match`. A malformed number such as
`100abc` points at the complete token. An unknown value does not also produce a
spurious `unit` result mismatch.

If diagnostics do not appear, inspect the filetype and connection:

```vim
:set filetype?
:checkhealth vim.lsp
:lua print(vim.lsp.log.get_filename())
```

The filetype must be `el`. Check that the configured executable exists, and
read project-loading errors in the LSP log.

## Complete names and inspect signatures

In a project buffer, type `IO.pr` to get candidates such as `print` and
`println`. Completion also works after `IO.` before the expression is complete.
Suggestions include visible locals, parameters, modules, keywords, and
functions, and respect private function visibility.

Press `K` on a function name to inspect its declared signature. Hover includes
project, dependency, and standard-library functions. It shows generic bounds
without substituting types from a particular call. Inferred local types,
struct-field completion, go-to-definition, and rename are unavailable.

## Indent and highlight source

The plugin sets two-space interactive indentation and EL comment options.
Use `o`, `O`, Enter, `==`, or `gg=G` on complete or incomplete source.
Indentation tracks blocks, match arms, delimiters, literals, and comments
without an LSP server or Tree-sitter parser.

The Vim syntax fallback highlights current EL syntax. For Tree-sitter, use the
current [tree-sitter-el grammar](https://github.com/el-lang-org/tree-sitter-el).
Older parsers for `defmodule` and `def` do not support current syntax.

Keep the bundled indentation expression when you enable Tree-sitter. In a
shared Tree-sitter setup, apply its indent expression only to other filetypes:

```lua
if pcall(vim.treesitter.start, bufnr) and vim.bo[bufnr].filetype ~= "el" then
	vim.bo[bufnr].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
end
```

Inspect the active expression with `:setlocal indentexpr?`. For EL it is
`v:lua.require'el.indent'.get(v:lnum)`.

## Format the buffer

Run:

```vim
:lua vim.lsp.buf.format({ async = false })
```

Formatting applies the same canonical two-space layout as `el fmt`, preserving
comments and LF or CRLF line endings. Invalid syntax reports an error and
leaves the buffer unchanged. The server returns edits without writing the
source file or `el.lock`. Save the buffer to keep the result.

Range formatting, on-type formatting, and automatic formatting on save are
unavailable. See the [CLI reference](/getting-started/cli#el-fmt) for file and
standard-input formatting.
