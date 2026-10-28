import assert from "node:assert/strict";
import test from "node:test";
import { getLatestReadings, getSensorReadings, getSensors } from "../src/utils/sensorApi.mjs";

test("uses the deployed versioned API when no override is configured", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = globalThis.__SENSOR_API_BASE_URL__;
  delete globalThis.__SENSOR_API_BASE_URL__;
  let requestUrl;
  globalThis.fetch = async url => {
    requestUrl = String(url);
    return new Response(JSON.stringify({ sensors: [], nextCursor: null }), { status: 200 });
  };

  try {
    await getSensors();
    assert.match(
      requestUrl,
      /^https:\/\/g0hg7suk04\.execute-api\.us-east-1\.amazonaws\.com\/prod\/v1\/sensors\?/
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl !== undefined) globalThis.__SENSOR_API_BASE_URL__ = originalApiUrl;
  }
});

test("getSensors follows cursors and returns structured sensor records", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = globalThis.__SENSOR_API_BASE_URL__;
  const urls = [];
  globalThis.__SENSOR_API_BASE_URL__ = "https://api.example/prod/v1/";
  globalThis.fetch = async url => {
    urls.push(String(url));
    const page = urls.length === 1
      ? { sensors: [{ sensorId: "room", name: "room" }], nextCursor: "next/page" }
      : { sensors: [{ sensorId: "office", name: "office" }], nextCursor: null };
    return new Response(JSON.stringify(page), { status: 200 });
  };

  try {
    const sensors = await getSensors();
    assert.deepEqual(sensors.map(sensor => sensor.sensorId), ["room", "office"]);
    assert.match(urls[0], /\/v1\/sensors\?limit=500$/);
    assert.match(urls[1], /cursor=next%2Fpage/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete globalThis.__SENSOR_API_BASE_URL__;
    else globalThis.__SENSOR_API_BASE_URL__ = originalApiUrl;
  }
});

test("getLatestReadings uses the bulk readings endpoint", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = globalThis.__SENSOR_API_BASE_URL__;
  let request;
  globalThis.__SENSOR_API_BASE_URL__ = "https://api.example/prod/v1";
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({
      readings: [
        { sensorId: "room", reading: { temperature: 20, humidity: 45, timestamp: "2026-10-28T10:00:00Z" } },
      ],
    }), { status: 200 });
  };

  try {
    const readings = await getLatestReadings(["room"]);
    assert.deepEqual(readings.room, {
      temperature: 20,
      humidity: 45,
      timestamp: "2026-10-28T10:00:00Z",
    });
    assert.match(request.url, /\/v1\/sensors\/latest$/);
    assert.deepEqual(JSON.parse(request.options.body), { sensorIds: ["room"] });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete globalThis.__SENSOR_API_BASE_URL__;
    else globalThis.__SENSOR_API_BASE_URL__ = originalApiUrl;
  }
});

test("getSensorReadings follows history page cursors", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = globalThis.__SENSOR_API_BASE_URL__;
  const urls = [];
  globalThis.__SENSOR_API_BASE_URL__ = "https://api.example/prod/v1";
  globalThis.fetch = async url => {
    urls.push(String(url));
    const page = urls.length === 1
      ? {
          interval: "raw",
          dataMode: "raw",
          readings: [{ timestamp: "2026-10-28T10:00:00Z", temperature: 20, humidity: 45 }],
          nextCursor: "second",
        }
      : {
          interval: "raw",
          dataMode: "raw",
          readings: [{ timestamp: "2026-10-28T10:05:00Z", temperature: 21, humidity: 46 }],
          nextCursor: null,
        };
    return new Response(JSON.stringify(page), { status: 200 });
  };

  try {
    const result = await getSensorReadings(
      "living room",
      "2026-10-28T10:00:00Z",
      "2026-10-28T10:10:00Z"
    );
    assert.equal(result.readings.length, 2);
    assert.equal(result.interval, "raw");
    assert.equal(result.dataMode, "raw");
    assert.match(urls[0], /\/v1\/sensors\/living%20room\/readings\?/);
    assert.match(urls[0], /interval=auto/);
    assert.match(urls[1], /cursor=second/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete globalThis.__SENSOR_API_BASE_URL__;
    else globalThis.__SENSOR_API_BASE_URL__ = originalApiUrl;
  }
});

test("getSensorReadings preserves sampled interval metadata", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiUrl = globalThis.__SENSOR_API_BASE_URL__;
  globalThis.__SENSOR_API_BASE_URL__ = "https://api.example/prod/v1";
  globalThis.fetch = async () => new Response(JSON.stringify({
    interval: "day",
    dataMode: "sampled",
    readings: [{
      timestamp: "2026-10-28T10:00:00Z",
      temperature: 20,
      humidity: 45,
      temperatureMin: 20,
      temperatureMax: 20,
      humidityMin: 45,
      humidityMax: 45,
      sampleCount: 1,
    }],
    nextCursor: null,
  }), { status: 200 });

  try {
    const result = await getSensorReadings(
      "living room",
      "2026-09-28T00:00:00Z",
      "2026-10-28T23:59:59Z"
    );
    assert.equal(result.interval, "day");
    assert.equal(result.dataMode, "sampled");
    assert.equal(result.readings[0].sampleCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete globalThis.__SENSOR_API_BASE_URL__;
    else globalThis.__SENSOR_API_BASE_URL__ = originalApiUrl;
  }
});
