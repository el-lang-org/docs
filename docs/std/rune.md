# Rune

A `rune` is one Unicode scalar value, written with single quotes:

```el
letter = 'λ'
```

## Functions

### Rune.to_string

```el
Rune.to_string(value: rune) -> string
```

Returns the rune as a single-grapheme UTF-8 string:

```el
text = Rune.to_string('λ')   # "λ"
```

## Notes

A `rune` converts losslessly to `u32`; integer-to-`rune` conversion validates
that the value is a Unicode scalar value. `rune` is not a byte and not a
grapheme cluster.
