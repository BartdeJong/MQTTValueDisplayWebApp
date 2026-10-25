export const DEFAULT_LOCATIONS = [
  { name: "Woonkamer", deviceId: "Woonkamer" },
  { name: "Kantoor Bart", deviceId: "Kantoor Bart" },
  { name: "Kantoor Sjoukje", deviceId: "Kantoor Sjoukje" },
  { name: "Buiten", deviceId: "Buiten" },
  { name: "Slaapkamer", deviceId: "Slaapkamer" },
  { name: "Printer", deviceId: "Printer" },
];

export function parseLocationsCookie(cookieString) {
  const match = cookieString.match(/(?:^|;\s*)locationsData=([^;]*)/);
  if (!match) {
    return null;
  }

  let locations;
  try {
    locations = JSON.parse(decodeURIComponent(match[1]));
  } catch {
    throw new Error("De opgeslagen locaties konden niet worden gelezen.");
  }

  if (!Array.isArray(locations) || locations.some(location =>
    !location ||
    typeof location.name !== "string" ||
    typeof location.deviceId !== "string"
  )) {
    throw new Error("De opgeslagen locaties hebben een ongeldig formaat.");
  }
  return locations;
}

export function formatLocationsCookie(locations, secure = false) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  return `locationsData=${encodeURIComponent(JSON.stringify(locations))};expires=${expires};path=/;SameSite=Lax${secure ? ";Secure" : ""}`;
}
