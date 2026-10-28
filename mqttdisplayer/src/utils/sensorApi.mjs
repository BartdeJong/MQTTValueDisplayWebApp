const DEFAULT_SENSOR_API_BASE_URL = "https://g0hg7suk04.execute-api.us-east-1.amazonaws.com/prod/v1";
const LATEST_SENSOR_BATCH_SIZE = 100;
const HISTORY_PAGE_SIZE = 500;

function getSensorApiBaseUrl() {
  const configuredUrl = import.meta.env?.VITE_SENSOR_API_BASE_URL ||
    globalThis.__SENSOR_API_BASE_URL__ ||
    DEFAULT_SENSOR_API_BASE_URL;
  return configuredUrl.replace(/\/+$/, "");
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${getSensorApiBaseUrl()}${path}`, options);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("De sensor-API stuurde geen geldige JSON.");
  }

  if (!response.ok) {
    const error = new Error(payload.error || `De sensor-API antwoordde met status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function getSensors({ signal } = {}) {
  const sensors = [];
  let cursor = null;

  do {
    const query = new URLSearchParams({ limit: "500" });
    if (cursor) query.set("cursor", cursor);
    const result = await requestJson(`/sensors?${query}`, { signal });
    if (!Array.isArray(result.sensors)) {
      throw new Error("De sensor-API stuurde een ongeldige sensorlijst.");
    }
    sensors.push(...result.sensors);
    cursor = result.nextCursor;
  } while (cursor);

  return sensors;
}

export async function getLatestReadings(sensorIds, { signal } = {}) {
  const readings = {};
  for (let index = 0; index < sensorIds.length; index += LATEST_SENSOR_BATCH_SIZE) {
    const batch = sensorIds.slice(index, index + LATEST_SENSOR_BATCH_SIZE);
    const result = await requestJson("/sensors/latest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sensorIds: batch }),
      signal,
    });
    if (!Array.isArray(result.readings)) {
      throw new Error("De sensor-API stuurde een ongeldige meetlijst.");
    }
    for (const item of result.readings) {
      if (typeof item.sensorId !== "string" || (item.reading !== null && typeof item.reading !== "object")) {
        throw new Error("De sensor-API stuurde een ongeldige meting.");
      }
      readings[item.sensorId] = item.reading;
    }
  }
  return readings;
}

export async function getSensorReadings(sensorId, from, to, { signal, interval = "auto" } = {}) {
  const readings = [];
  let cursor = null;
  let responseInterval = null;
  let responseDataMode = null;

  do {
    const query = new URLSearchParams({
      from,
      to,
      limit: String(HISTORY_PAGE_SIZE),
      interval,
    });
    if (cursor) query.set("cursor", cursor);
    const result = await requestJson(
      `/sensors/${encodeURIComponent(sensorId)}/readings?${query}`,
      { signal }
    );
    if (!Array.isArray(result.readings)) {
      throw new Error("De sensor-API stuurde een ongeldige geschiedenis.");
    }
    if (!["raw", "hour", "day"].includes(result.interval)) {
      throw new Error("De sensor-API stuurde een ongeldig geschiedenisinterval.");
    }
    if (!["raw", "sampled"].includes(result.dataMode)) {
      throw new Error("De sensor-API stuurde een ongeldig geschiedenisformaat.");
    }
    if (responseInterval && responseInterval !== result.interval) {
      throw new Error("Het geschiedenisinterval wijzigde tussen pagina's.");
    }
    if (responseDataMode && responseDataMode !== result.dataMode) {
      throw new Error("Het geschiedenisformaat wijzigde tussen pagina's.");
    }
    responseInterval = result.interval;
    responseDataMode = result.dataMode;
    readings.push(...result.readings);
    cursor = result.nextCursor;
  } while (cursor);

  return {
    readings,
    interval: responseInterval || "raw",
    dataMode: responseDataMode || "raw",
  };
}

export async function getSensorSummary(sensorId, from, to, { signal } = {}) {
  const query = new URLSearchParams({ from, to });
  return requestJson(
    `/sensors/${encodeURIComponent(sensorId)}/summary?${query}`,
    { signal }
  );
}
