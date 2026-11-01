# Time

`Time` provides Unix and monotonic clocks and UTC calendar arithmetic.
`Time.DateTime` has `i64` fields `year`, `month`, `day`, `hour`, `minute`,
`second`, and `nanosecond`. Months run from 1 through 12. The calendar is
proleptic Gregorian, without leap seconds or time zones.

## Functions

### Time.unix_nanos

```el
Time.unix_nanos() -> i64
```

Returns the current wall-clock time as nanoseconds since 1970-01-01T00:00:00Z.
Returns 0 if the system clock cannot be read. May jump if the system clock is
adjusted; use `monotonic_nanos` to measure durations.

```el
value = Time.unix_nanos()
```

### Time.monotonic_nanos

```el
Time.monotonic_nanos() -> i64
```

Returns nanoseconds from a monotonic clock whose zero point is arbitrary. Only
differences between two readings are meaningful. Returns 0 if the clock cannot
be read.

```el
value = Time.monotonic_nanos()
```

### Time.is_leap_year

```el
Time.is_leap_year(year: i64) -> bool
```

Returns true when `year` is a leap year in the Gregorian calendar (divisible
by 4, except centuries not divisible by 400).

```el
value = Time.is_leap_year(2024) # true
```

### Time.days_in_month

```el
Time.days_in_month(year: i64, month: i64) -> i64
```

Returns the number of days in `month` (1 to 12) of `year`: 28 or 29 for
February, 30 or 31 otherwise. Months outside 1 to 12 are not validated and
count as 31.

```el
value = Time.days_in_month(2024, 2) # 29
```

### Time.days_from_civil

```el
Time.days_from_civil(year: i64, month: i64, day: i64) -> i64
```

Returns the number of days from 1970-01-01 to the proleptic Gregorian date
`year`-`month`-`day`; negative before 1970. `month` is 1 to 12 and `day` is
1-based. Out-of-range fields are not validated.

```el
value = Time.days_from_civil(1970, 1, 2) # 1
```

### Time.from_unix_seconds

```el
Time.from_unix_seconds(seconds: i64) -> Time.DateTime
```

Converts `seconds` since the Unix epoch (negative for earlier dates) into a
UTC `DateTime` with a zero nanosecond field.

```el
value = Time.format(Time.from_unix_seconds(1000000000)) # "2001-09-09T01:46:40Z"
```

### Time.from_unix_nanos

```el
Time.from_unix_nanos(nanos: i64) -> Time.DateTime
```

Converts `nanos` since the Unix epoch (negative for earlier dates) into a UTC
`DateTime`, including the sub-second `nanosecond` field (0 to 999999999).

```el
value = Time.from_unix_nanos(1500000000).nanosecond # 500000000
```

### Time.to_unix_seconds

```el
Time.to_unix_seconds(value: Time.DateTime) -> i64
```

Converts `value`, read as UTC, to whole seconds since the Unix epoch. The
`nanosecond` field is ignored (truncated). Fields are not validated.

```el
value = Time.to_unix_seconds(Time.from_unix_seconds(1)) # 1
```

### Time.weekday

```el
Time.weekday(value: Time.DateTime) -> i64
```

Returns the day of the week of `value`'s date: 1 is Monday, 7 is Sunday.

```el
value = Time.weekday(Time.from_unix_seconds(0)) # 4, Thursday
```

### Time.add_seconds

```el
Time.add_seconds(value: Time.DateTime, seconds: i64) -> Time.DateTime
```

Returns `value` moved by `seconds` (negative to go back), normalizing carries
across minutes, days, months, and years. The nanosecond field is kept. `value`
is unchanged.

```el
value = Time.format(Time.add_seconds(Time.from_unix_seconds(0), 60)) # "1970-01-01T00:01:00Z"
```

### Time.now

```el
Time.now() -> Time.DateTime
```

Returns the current UTC time as a `DateTime` (from `unix_nanos`).

```el
value = Time.now()
```

### Time.format

```el
Time.format(value: Time.DateTime) -> string
```

Formats `value` as ISO 8601 UTC with second precision; the nanosecond field is
not shown.

```el
value = Time.format(Time.from_unix_seconds(0)) # "1970-01-01T00:00:00Z"
```

`unix_nanos` measures nanoseconds since 1970-01-01T00:00:00Z.
`monotonic_nanos` has an arbitrary fixed origin and never decreases.
A failed clock read returns 0. `now` converts the Unix clock to a UTC value.

Unix conversions round toward negative infinity, including dates before 1970.
`weekday` returns 1 for Monday through 7 for Sunday. `format` emits ISO 8601
with second precision. Parsing and sub-second formatting are unsupported.

```el
stamp = Time.from_unix_seconds(1000000000)
IO.println(Time.format(stamp)) # 2001-09-09T01:46:40Z
```
