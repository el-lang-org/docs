# Xml

`Xml` parses XML into ordinary EL structs and unions. It formats element-only
content with two-space indentation and preserves mixed-content text.

## Document types

```el
struct Element do
	name: string
	attributes: [{string, string}]
	children: [Xml.Node]
end

@type Node = {:element, Xml.Element} | {:text, string} | {:cdata, string} |
	{:comment, string} | {:instruction, string} | {:doctype, string}

struct Document do
	before: [Xml.Node]
	root: Xml.Element
	after: [Xml.Node]
end
```

These declarations belong to `Xml`. Construct values with `%Xml.Element{...}`
and `%Xml.Document{...}`. Attributes retain source order. `before` and `after`
hold comments, instructions, and the doctype around the root. An XML
declaration is an ordinary `:instruction` node.

## Parse and format

### Xml.parse

```el
Xml.parse(text: string) -> {:ok, Xml.Document} | {:error, :malformed, string}
```

Parses `text` as one complete XML document. Returns `{:ok, Document}`, or
`{:error, :malformed, message}` when `text` is not well-formed, where
`message` reads `parse error: <detail> at line <n>, column <m>` (the column
counts characters).

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		IO.println(document.root.name) # root
	{:error, :malformed, message} -> IO.report(message)
end
```

### Xml.format

```el
Xml.format(document: Xml.Document) -> string
```

Pretty-prints `document` with two-space indentation and no trailing newline.
An element that contains text is emitted on one line exactly as parsed;
layout-only whitespace between other nodes is regenerated.

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		IO.println(Xml.format(document))
	{:error, :malformed, message} -> IO.report(message)
end
```

### Xml.encode

```el
Xml.encode(document: Xml.Document) -> string
```

Serializes `document` on one line, with each text node exactly as parsed.

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		IO.println(Xml.encode(document))
	{:error, :malformed, message} -> IO.report(message)
end
```

### Xml.reformat

```el
Xml.reformat(text: string) -> {:ok, string} | {:error, :malformed, string}
```

Parses `text` and pretty-prints it (`parse` then `format`). Returns `{:ok,
string}`, or the `{:error, :malformed, message}` from `parse`.

```el
match Xml.reformat("<root><item>EL</item></root>") do
	{:ok, text} -> IO.println(text)
	{:error, :malformed, message} -> IO.report(message)
end
```

`parse` consumes one complete well-formed document, with matching tags, quoted
attribute values, unique attribute names, and one root element. It skips a
leading UTF-8 byte order mark. It decodes the five predefined entities and
decimal or hexadecimal character references. Unknown entities, invalid scalar
references, and nesting deeper than 200 elements return `:malformed`.

Messages have the form `parse error: <detail> at line <n>, column <m>`.
Columns count characters. The parser does not validate DTDs, expand custom
entities, resolve namespaces, or normalize attribute whitespace. It keeps a
doctype as raw text. A name such as `a:b` is one name.

`format` uses two-space indentation without a trailing newline. It drops
whitespace-only text around element-only children and writes empty elements
as `<a/>`. Mixed content with non-blank text or CDATA keeps its parsed content
without added indentation. Attribute order stays unchanged; entity spellings
become escaped decoded text. Formatting is idempotent on its own output.
`encode` emits compact XML without pretty-print indentation. `reformat`
combines parsing and formatting.

```el
match Xml.reformat("<root><item id=\"1\">EL</item></root>") do
	{:ok, text} -> IO.println(text)
	{:error, :malformed, message} -> IO.report(message)
end
```

This prints:

```xml
<root>
  <item id="1">EL</item>
</root>
```

## Inspect elements

### Xml.attribute

```el
Xml.attribute(element: Xml.Element, name: string) -> Option[string]
```

Returns `{:some, value}` for the attribute called `name` on `element`, or
`:none` if it has no such attribute.

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		value = Xml.attribute(document.root, "id") # :none
	{:error, :malformed, message} -> IO.report(message)
end
```

### Xml.elements

```el
Xml.elements(element: Xml.Element, name: string) -> [Xml.Element]
```

Returns the direct child elements of `element` called `name`, in document
order; `[]` if there are none. Does not search deeper descendants.

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		items = Xml.elements(document.root, "item") # one direct child
	{:error, :malformed, message} -> IO.report(message)
end
```

### Xml.text_content

```el
Xml.text_content(element: Xml.Element) -> string
```

Returns the text and CDATA of `element` and all its descendants, concatenated
in document order. Markup and comments contribute nothing.

```el
match Xml.parse("<root><item id=\"1\">EL</item></root>") do
	{:ok, document} ->
		IO.println(Xml.text_content(document.root)) # EL
	{:error, :malformed, message} -> IO.report(message)
end
```

`attribute` returns the named attribute or `:none`. `elements` returns matching
direct child elements in document order. `text_content` concatenates text and
CDATA from the element and its descendants.
