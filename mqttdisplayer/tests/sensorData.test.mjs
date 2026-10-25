import test from "node:test";
import assert from "node:assert/strict";
import {
  formatAge,
  getSensorFreshness,
  parseAM2301Payload,
  parseHistoricalReadings,
  parseNumericReading,
  parseTimestamp,
} from "../src/utils/sensorData.mjs";

test("sensor freshness has fresh, stale, offline, and unknown states", () => {
  const now = 1_000_000;
  assert.equal(getSensorFreshness(now - 60_000, now).state, "fresh");
  assert.equal(getSensorFreshness(now - 9 * 60_000, now).state, "fresh");
  assert.equal(getSensorFreshness(now - 10 * 60_000, now).state, "stale");
  assert.equal(getSensorFreshness(now - 31 * 60_000, now).state, "offline");
  assert.equal(getSensorFreshness("invalid", now).state, "unknown");
});

test("age labels explain when the latest reading arrived", () => {
  const now = 1_000_000;
  assert.equal(formatAge(now - 30_000, now), "Zojuist");
  assert.equal(formatAge(now - 2 * 60_000, now), "2 min geleden");
  assert.equal(formatAge(null, now), "Nog geen meting");
});

test("timezone-free sensor timestamps are treated as UTC across DST transitions", () => {
  const observedAt = Date.parse("2026-10-25T20:19:07Z");
  const now = Date.parse("2026-10-25T20:22:45Z");

  assert.equal(parseTimestamp("2026-10-25 20:19:07"), observedAt);
  assert.deepEqual(getSensorFreshness("2026-10-25 20:19:07", now), {
    state: "fresh",
    ageMs: now - observedAt,
  });
  assert.equal(parseTimestamp("2026-10-25T20:19:07+01:00"), Date.parse("2026-10-25T19:19:07Z"));
});

test("AM2301 readings are parsed and invalid payloads are rejected", () => {
  assert.deepEqual(parseAM2301Payload('{"AM2301":{"Temperature":"21.5","Humidity":46}}'), {
    temperature: 21.5,
    humidity: 46,
  });
  assert.throws(() => parseAM2301Payload("{"));
  assert.throws(() => parseAM2301Payload('{"AM2301":{}}'));
});

test("numeric and historical readings reject invalid values", () => {
  assert.equal(parseNumericReading("22.4"), 22.4);
  assert.deepEqual(parseHistoricalReadings("20.1\r\n20.4\r\n"), [
    { value: 20.1, timestamp: null },
    { value: 20.4, timestamp: null },
  ]);
  assert.deepEqual(parseHistoricalReadings(""), []);
  assert.throws(() => parseNumericReading("warm"));
  assert.throws(() => parseHistoricalReadings("20.1\nnot-a-number"));
});

test("historical readings parse API value and UTC timestamp records", () => {
  assert.deepEqual(parseHistoricalReadings(
    "17.4|2026-10-25 20:44:30\r\n17.3|2026-10-25 20:49:30"
  ), [
    { value: 17.4, timestamp: Date.parse("2026-10-25T20:44:30Z") },
    { value: 17.3, timestamp: Date.parse("2026-10-25T20:49:30Z") },
  ]);
  assert.throws(() => parseHistoricalReadings("17.4|not-a-time"), /ongeldige tijdsaanduiding/);
});
