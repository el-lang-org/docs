# Time

`Time` provides Unix and monotonic clocks and UTC calendar arithmetic.
`Time.DateTime` has `i64` fields `year`, `month`, `day`, `hour`, `minute`,
`second`, and `nanosecond`. Months run from 1 through 12. The calendar is
proleptic Gregorian, without leap seconds or time zones.

## Functions

```el
Time.unix_nanos() -> i64
Time.monotonic_nanos() -> i64
Time.is_leap_year(year: i64) -> bool
Time.days_in_month(year: i64, month: i64) -> i64
Time.days_from_civil(year: i64, month: i64, day: i64) -> i64
Time.from_unix_seconds(seconds: i64) -> Time.DateTime
Time.from_unix_nanos(nanos: i64) -> Time.DateTime
Time.to_unix_seconds(value: Time.DateTime) -> i64
Time.weekday(value: Time.DateTime) -> i64
Time.add_seconds(value: Time.DateTime, seconds: i64) -> Time.DateTime
Time.now() -> Time.DateTime
Time.format(value: Time.DateTime) -> string
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
