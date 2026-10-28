# MQTT Waarden

Dashboard for live temperature and humidity readings, location management, and sensor history.

## Project setup

```sh
npm ci
```

## Development server

```sh
npm run dev
```

To test on a phone connected to the same Wi-Fi, open `http://<computer-ip>:8085`
in the phone's browser (for example, `http://192.168.1.216:8085`).

The frontend defaults to the deployed production `SensorApiV1Url`. To use a
different deployment, override `VITE_SENSOR_API_BASE_URL` with that stack's
output before building. For a local PowerShell build:

```powershell
$env:VITE_SENSOR_API_BASE_URL = "<SensorApiV1Url output>"
npm run build
```

The app never falls back to the legacy API endpoints.

## Sensor history

History supports 2-hour, 1-day, 1-week, 30-day, and 90-day presets, plus custom
date ranges up to 90 days. Ranges up to 7 days use raw readings; longer ranges
use one representative reading near the midpoint of each UTC day to keep
requests bounded. Long-range charts label their min/average/max as sample
statistics, not full-day extrema or averages.

## Production build

```sh
npm run build
```

## Deploy to GitHub Pages

```sh
npm run deploy
```

This builds the app and publishes its static files to the `main` branch of
`BartdeJong/WeatherProd`, which serves `https://bartdejong.github.io/WeatherProd/`.
Git must be authenticated with permission to push to that repository.

## Tests and lint

```sh
npm test
npm run lint
```

The app uses Svelte 5 and Vite 8. Use Node.js 20.19+, 22.13+, or newer for local
development and CI. Sensor history and freshness helpers are covered by the built-in
Node.js test runner.

The production build retains the `/WeatherProd/` base path, existing manifest URL,
`service-worker.js` location and scope, `locationsData` cookie, and
`userBackgroundImage` local-storage key so previously installed PWAs keep their
stored data and receive the new app shell when their service worker updates. The
dashboard no longer displays or manages background images.
