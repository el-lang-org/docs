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

```el
Xml.parse(text: string) -> {:ok, Xml.Document} | {:error, :malformed, string}
Xml.format(document: Xml.Document) -> string
Xml.encode(document: Xml.Document) -> string
Xml.reformat(text: string) -> {:ok, string} | {:error, :malformed, string}
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

```el
Xml.attribute(element: Xml.Element, name: string) -> Option[string]
Xml.elements(element: Xml.Element, name: string) -> [Xml.Element]
Xml.text_content(element: Xml.Element) -> string
```

`attribute` returns the named attribute or `:none`. `elements` returns matching
direct child elements in document order. `text_content` concatenates text and
CDATA from the element and its descendants.
