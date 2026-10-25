<script>
	import { onMount } from "svelte";
	import { formatAge, getSensorFreshness, parseTimestamp } from "../utils/sensorData.mjs";

	const SENSOR_URL = "https://681u4lp0vi.execute-api.eu-central-1.amazonaws.com/prod/read-temp-hum-cdk";

	let { name, deviceId, period } = $props();
	let jsonResponse = $state(null);
	let lastUpdatedAt = $state(null);
	let showHistory = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state("");
	let now = $state(Date.now());
	let HistoryComponent = $state(null);
	let historyLoadError = $state("");

	const observationTime = $derived.by(() => {
		const sensorTime = jsonResponse && parseTimestamp(jsonResponse.date_time2);
		return Number.isFinite(sensorTime) ? sensorTime : lastUpdatedAt;
	});
	const freshness = $derived(getSensorFreshness(observationTime, now));
	const statusText = $derived.by(() => {
		if (isLoading && !jsonResponse) return "Meting wordt geladen…";
		if (errorMessage) return errorMessage;
		if (!jsonResponse) return "Nog geen meting beschikbaar";
		if (freshness.state !== "fresh") {
			return `Geen recente meting · ${formatAge(observationTime, now)}`;
		}
		return `Actueel · ${formatAge(observationTime, now)}`;
	});
	const statusClass = $derived(`sensor-status sensor-status--${jsonResponse ? freshness.state : "error"}`);

	let activeController;

	async function getTempAndHum() {
		if (isLoading) return;
		isLoading = true;
		const controller = new AbortController();
		activeController = controller;
		try {
			const response = await fetch(SENSOR_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sensor_name: deviceId }),
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`De sensorserver antwoordde met status ${response.status}.`);
			}
			const result = await response.json();
			if (controller.signal.aborted) return;
			if (result.message === "Sensor not found") {
				jsonResponse = null;
				errorMessage = "Sensor niet gevonden.";
				return;
			}
			if (!Number.isFinite(Number(result.temperature)) ||
				!Number.isFinite(Number(result.humidity))) {
				throw new Error("De sensorserver stuurde ongeldige meetwaarden.");
			}
			jsonResponse = result;
			lastUpdatedAt = Date.now();
			errorMessage = "";
		} catch (error) {
			if (error.name !== "AbortError" && !controller.signal.aborted) {
				errorMessage = "Meting ophalen mislukt. Opnieuw proberen volgt automatisch.";
				console.error("Sensor reading request failed:", error);
			}
		} finally {
			if (!controller.signal.aborted) isLoading = false;
		}
	}

	async function toggleHistory() {
		showHistory = !showHistory;
		if (showHistory && !HistoryComponent) await loadHistoryComponent();
	}

	async function loadHistoryComponent() {
		historyLoadError = "";
		try {
			HistoryComponent = (await import("./HistoryChart.svelte")).default;
		} catch (error) {
			historyLoadError = "Meetgeschiedenis laden is mislukt. Probeer het opnieuw.";
			console.error("History component could not be loaded:", error);
		}
	}

	onMount(() => {
		void getTempAndHum();
		const pollTimer = setInterval(() => void getTempAndHum(), 120_000);
		const refreshTimer = setInterval(() => {
			now = Date.now();
		}, 30_000);

		return () => {
			clearInterval(pollTimer);
			clearInterval(refreshTimer);
			activeController?.abort();
		};
	});
</script>

<tbody>
	<tr class:sensor-row--stale={jsonResponse && freshness.state !== "fresh"}>
		<td>
			<button
				class="sensor-detail-button"
				type="button"
				aria-expanded={showHistory}
				onclick={toggleHistory}
			>
				{name}
			</button>
			<small class={statusClass} role="status">{statusText}</small>
		</td>
		{#if jsonResponse}
			<td class="largeText">{jsonResponse.temperature} °C</td>
			<td class="largeText">{jsonResponse.humidity} %</td>
		{:else}
			<td colspan="2">{errorMessage || "Meting wordt geladen…"}</td>
		{/if}
	</tr>
	{#if showHistory && historyLoadError}
		<tr>
			<td colspan="3" class="history-cell">
				<p role="alert">{historyLoadError}</p>
				<button class="sensor-detail-button" type="button" onclick={loadHistoryComponent}>
					Opnieuw proberen
				</button>
			</td>
		</tr>
	{:else if showHistory && HistoryComponent}
		<tr>
			<td colspan="3" class="history-cell">
				<HistoryComponent sensorName={deviceId} period={Number(period)} />
			</td>
		</tr>
	{/if}
</tbody>

<style>
	.sensor-detail-button {
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.sensor-detail-button:focus-visible {
		outline: 3px solid #efbf04;
		outline-offset: 3px;
	}

	.history-cell {
		padding: 8px !important;
	}
</style>
