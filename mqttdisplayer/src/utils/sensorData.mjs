const STALE_AFTER_MS = 10 * 60 * 1000;
const OFFLINE_AFTER_MS = 30 * 60 * 1000;

export function parseTimestamp(timestamp) {
  if (typeof timestamp === "number") {
    return timestamp;
  }
  if (typeof timestamp !== "string") {
    return Number.NaN;
  }

  const databaseTimestamp = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/;
  const match = timestamp.match(databaseTimestamp);
  return Date.parse(match ? `${match[1]}T${match[2]}Z` : timestamp);
}

export function getSensorFreshness(timestamp, now = Date.now()) {
  const observedAt = parseTimestamp(timestamp);
  if (!Number.isFinite(observedAt)) {
    return { state: "unknown", ageMs: null };
  }

  const ageMs = Math.max(0, now - observedAt);
  if (ageMs >= OFFLINE_AFTER_MS) {
    return { state: "offline", ageMs };
  }
  if (ageMs >= STALE_AFTER_MS) {
    return { state: "stale", ageMs };
  }
  return { state: "fresh", ageMs };
}

export function formatAge(timestamp, now = Date.now()) {
  const { ageMs, state } = getSensorFreshness(timestamp, now);
  if (state === "unknown") {
    return "Nog geen meting";
  }
  if (ageMs < 60 * 1000) {
    return "Zojuist";
  }
  if (ageMs < 60 * 60 * 1000) {
    return `${Math.floor(ageMs / (60 * 1000))} min geleden`;
  }
  if (ageMs < 24 * 60 * 60 * 1000) {
    return `${Math.floor(ageMs / (60 * 60 * 1000))} uur geleden`;
  }
  return `${Math.floor(ageMs / (24 * 60 * 60 * 1000))} dagen geleden`;
}

export function parseAM2301Payload(payload) {
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("De sensor heeft ongeldige gegevens verstuurd.");
  }

  const temperature = Number(parsed?.AM2301?.Temperature);
  const humidity = Number(parsed?.AM2301?.Humidity);
  if (!Number.isFinite(temperature) || !Number.isFinite(humidity)) {
    throw new Error("Temperatuur of luchtvochtigheid ontbreekt.");
  }
  return { temperature, humidity };
}

export function parseNumericReading(payload) {
  const value = Number.parseFloat(String(payload).trim());
  if (!Number.isFinite(value)) {
    throw new Error("De sensorwaarde is ongeldig.");
  }
  return value;
}

export function parseHistoricalReadings(text) {
  if (!text.trim()) {
    return [];
  }

  return text.split(/\r?\n/).filter(line => line.trim() !== "").map(line => {
    const [rawValue, ...rawTimestamp] = line.split("|");
    const value = Number(rawValue.trim());
    if (!Number.isFinite(value)) {
      throw new Error("De historie bevat een ongeldige meetwaarde.");
    }

    const timestampText = rawTimestamp.join("|").trim();
    const timestamp = timestampText ? parseTimestamp(timestampText) : null;
    if (timestampText && !Number.isFinite(timestamp)) {
      throw new Error("De historie bevat een ongeldige tijdsaanduiding.");
    }

    return { value, timestamp };
  });
}
