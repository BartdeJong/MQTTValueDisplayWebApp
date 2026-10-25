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
			return `Niet recent · ${formatAge(observationTime, now)}`;
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

<article class="sensor-card" class:sensor-row--stale={jsonResponse && freshness.state !== "fresh"}>
	<header class="sensor-card-heading">
		<div class="sensor-place">
			<span class="place-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M3.5 10.4 12 3l8.5 7.4v9.1a1 1 0 0 1-1 1h-5.2v-6h-4.6v6H4.5a1 1 0 0 1-1-1v-9.1Z" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
			<div>
				<h3>{name}</h3>
				<p class={statusClass} role={errorMessage ? "alert" : "status"}>{statusText}</p>
			</div>
		</div>
		<button
			class="history-button"
			type="button"
			aria-expanded={showHistory}
			aria-label={`${showHistory ? "Verberg" : "Toon"} meetgeschiedenis voor ${name}`}
			onclick={toggleHistory}
		>
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M3.5 12a8.5 8.5 0 1 0 2.3-5.8L3.5 8.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
				<path d="M3.5 4.5v4h4M12 7.5V12l3 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			<span>{showHistory ? "Verberg" : "Geschiedenis"}</span>
		</button>
	</header>

	<div class="measurement-grid">
		<div class="measurement">
			<span class="measurement-label">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M10 14.4V5a2 2 0 1 1 4 0v9.4a4 4 0 1 1-4 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
					<path d="M12 11v7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
				</svg>
				Temperatuur
			</span>
			<strong>{jsonResponse ? jsonResponse.temperature : "—"}<small>{jsonResponse ? "°C" : ""}</small></strong>
		</div>
		<div class="measurement">
			<span class="measurement-label">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M12 3.5S5.5 11 5.5 15.2a6.5 6.5 0 1 0 13 0C18.5 11 12 3.5 12 3.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
					<path d="M9.5 16.2a2.5 2.5 0 0 0 2.5 2.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
				</svg>
				Luchtvochtigheid
			</span>
			<strong>{jsonResponse ? jsonResponse.humidity : "—"}<small>{jsonResponse ? "%" : ""}</small></strong>
		</div>
	</div>

	{#if showHistory && historyLoadError}
		<div class="history-panel">
			<p class="sensor-error" role="alert">{historyLoadError}</p>
			<button class="history-retry" type="button" onclick={loadHistoryComponent}>Opnieuw proberen</button>
		</div>
	{:else if showHistory && HistoryComponent}
		<div class="history-panel">
			<HistoryComponent sensorName={deviceId} period={Number(period)} />
		</div>
	{/if}
</article>

<style>
	.sensor-card {
		min-width: 0;
		padding: 20px;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		background: var(--color-surface);
		box-shadow: var(--shadow-card);
		transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
	}

	.sensor-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 34px rgba(26, 57, 52, 0.1);
	}

	.sensor-card-heading,
	.sensor-place {
		display: flex;
		align-items: center;
	}

	.sensor-card-heading {
		justify-content: space-between;
		gap: 12px;
	}

	.sensor-place {
		min-width: 0;
		gap: 11px;
	}

	.place-icon {
		display: grid;
		width: 42px;
		height: 42px;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 13px;
		background: #eaf5f1;
		color: var(--color-primary);
	}

	.place-icon svg {
		width: 22px;
		height: 22px;
	}

	.sensor-place h3 {
		max-width: 230px;
		margin: 0;
		overflow: hidden;
		font-size: 1rem;
		font-weight: 720;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sensor-place p {
		margin: 5px 0 0;
	}

	.history-button {
		display: inline-flex;
		min-height: 36px;
		align-items: center;
		gap: 6px;
		padding: 0 9px;
		border: 0;
		border-radius: 9px;
		background: transparent;
		color: var(--color-muted);
		font-size: 0.75rem;
		font-weight: 650;
		cursor: pointer;
	}

	.history-button:hover,
	.history-button[aria-expanded="true"] {
		background: #edf6f3;
		color: var(--color-primary-dark);
	}

	.history-button svg {
		width: 16px;
		height: 16px;
	}

	.measurement-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin-top: 20px;
	}

	.measurement {
		min-width: 0;
		padding: 13px 14px;
		border-radius: 13px;
		background: #f6f9f8;
	}

	.measurement-label {
		display: flex;
		align-items: center;
		gap: 7px;
		color: var(--color-muted);
		font-size: 0.76rem;
		font-weight: 600;
	}

	.measurement-label svg {
		width: 17px;
		height: 17px;
		color: var(--color-primary);
	}

	.measurement strong {
		display: block;
		margin-top: 8px;
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 690;
		letter-spacing: -0.055em;
		line-height: 1;
		white-space: nowrap;
	}

	.measurement strong small {
		margin-left: 4px;
		color: #647977;
		font-size: 0.85rem;
		font-weight: 550;
		letter-spacing: 0;
	}

	.sensor-error {
		margin: 12px 0 0;
		color: var(--color-danger);
		font-size: 0.84rem;
	}

	.history-panel {
		margin-top: 16px;
		padding-top: 15px;
		border-top: 1px solid var(--color-border);
	}

	.history-retry {
		min-height: 38px;
		padding: 0 12px;
		border: 1px solid var(--color-border);
		border-radius: 9px;
		background: white;
		color: var(--color-primary-dark);
		font-weight: 650;
		cursor: pointer;
	}

	@media (max-width: 480px) {
		.sensor-card {
			display: grid;
			grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.8fr) minmax(0, 0.85fr) 23px;
			align-items: center;
			gap: 1px 4px;
			min-height: 36px;
			padding: 2px 6px;
			border-radius: 9px;
			box-shadow: 0 2px 7px rgba(26, 57, 52, 0.04);
		}

		.sensor-card:hover {
			transform: none;
			box-shadow: 0 2px 7px rgba(26, 57, 52, 0.04);
		}

		.sensor-card-heading,
		.measurement-grid {
			display: contents;
		}

		.sensor-place {
			grid-column: 1;
			grid-row: 1;
			gap: 0;
			overflow: hidden;
		}

		.place-icon {
			display: none;
		}

		.sensor-place h3 {
			max-width: 100%;
			font-size: 0.82rem;
			line-height: 1;
		}

		.sensor-place p {
			max-width: 100%;
			margin-top: 2px;
			overflow: hidden;
			font-size: 0.62rem;
			line-height: 1;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.history-button span {
			display: none;
		}

		.history-button {
			grid-column: 4;
			grid-row: 1;
			width: 23px;
			min-height: 25px;
			justify-content: center;
			padding: 0;
			border-radius: 7px;
			background: #f1f7f5;
		}

		.history-button svg {
			width: 14px;
			height: 14px;
		}

		.measurement-grid {
			display: contents;
		}

		.measurement {
			display: block;
			min-width: 0;
			padding: 0;
			background: transparent;
		}

		.measurement-label {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		.measurement:nth-child(1) {
			grid-column: 2;
			grid-row: 1;
		}

		.measurement:nth-child(2) {
			grid-column: 3;
			grid-row: 1;
		}

		.measurement strong {
			margin: 0;
			font-size: 1rem;
			letter-spacing: -0.035em;
		}

		.measurement strong small {
			margin-left: 3px;
			font-size: 0.7rem;
		}

		.history-panel {
			grid-column: 1 / -1;
			margin-top: 5px;
			padding-top: 5px;
		}
	}
</style>
