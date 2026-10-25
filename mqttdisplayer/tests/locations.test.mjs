import test from "node:test";
import assert from "node:assert/strict";
import { formatLocationsCookie, parseLocationsCookie } from "../src/utils/locations.mjs";

test("saved location cookies round-trip", () => {
  const locations = [{ name: "Woonkamer", deviceId: "sensor-1" }];
  const cookie = formatLocationsCookie(locations);
  assert.deepEqual(parseLocationsCookie(cookie), locations);
  assert.match(cookie, /SameSite=Lax/);
});

test("missing, malformed, and invalid location cookies are distinguished", () => {
  assert.equal(parseLocationsCookie("other=value"), null);
  assert.throws(() => parseLocationsCookie("locationsData=%7B"));
  assert.throws(() => parseLocationsCookie(
    `locationsData=${encodeURIComponent(JSON.stringify([{ name: "Geen ID" }]))}`
  ));
});
