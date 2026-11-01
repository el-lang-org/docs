# Show

`Show` is a core protocol with static dispatch. See [Protocols](/getting-started/protocols)
for declarations and implementation rules.

## Functions

### Show.show

```el
Show.show[T: Show](value: T) -> string
```

Returns the diagnostic string representation of `value` through its
statically selected `Show` implementation. A top-level string is unchanged;
strings inside structural values are quoted and escaped. Floats and general
unions do not implement `Show`. The output is not stable serialization.

```el
text = Show.show(["ready", "waiting"]) # "[\"ready\", \"waiting\"]"
```
