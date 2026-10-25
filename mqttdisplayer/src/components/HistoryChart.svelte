<script>
	import { onDestroy } from "svelte";
	import Chart from "chart.js/auto";
	import { parseHistoricalReadings } from "../utils/sensorData.mjs";

	const HISTORY_ENDPOINTS = {
		Temperatuur: {
			type: "temps",
			apiId: "4dq0cg8znc",
			unit: "°C",
			color: "#8ce265",
		},
		Luchtvochtigheid: {
			type: "hums",
			apiId: "6oewbmsm96",
			unit: "%",
			color: "#8ecae6",
		},
	};

	const PERIOD_LABELS = { 24: "2 uur", 288: "1 dag", 2016: "1 week" };

	let { sensorName, period } = $props();
	let historicData = $state(null);
	let currentDataType = $state("Temperatuur");
	let isLoading = $state(false);
	let errorMessage = $state("");
	let historyCanvas;
	let chart;
	let retryToken = $state(0);
	let requestController;

	const periodLabel = $derived(PERIOD_LABELS[Number(period)] || "aangepaste periode");

	$effect(() => {
		const requestSensor = sensorName;
		const requestPeriod = Number(period);
		const requestType = currentDataType;
		retryToken;
		const controller = new AbortController();
		requestController = controller;
		historicData = null;
		isLoading = true;
		errorMessage = "";

		async function loadHistory() {
			const endpoint = HISTORY_ENDPOINTS[requestType];
			try {
				const response = await fetch(
					`https://${endpoint.apiId}.execute-api.eu-central-1.amazonaws.com/prod/read-last-${endpoint.type}-cdk`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							sensor_name: requestSensor,
							record_amount: requestPeriod,
						}),
						signal: controller.signal,
					}
				);
				if (!response.ok) {
					throw new Error(`De historie-server antwoordde met status ${response.status}.`);
				}
				const readings = parseHistoricalReadings(await response.text());
				if (!controller.signal.aborted) historicData = readings;
			} catch (error) {
				if (error.name !== "AbortError" && !controller.signal.aborted) {
					errorMessage = "Geschiedenis ophalen mislukt. Probeer het later opnieuw.";
					console.error("History request failed:", error);
				}
			} finally {
				if (!controller.signal.aborted) isLoading = false;
			}
		}

		void loadHistory();
		return () => controller.abort();
	});

	$effect(() => {
		const values = historicData;
		const dataType = currentDataType;
		if (chart) {
			chart.destroy();
			chart = null;
		}
		if (!historyCanvas || !values?.length) return;

		const endpoint = HISTORY_ENDPOINTS[dataType];
		const labels = values.map((_, index) => {
			const elapsed = (values.length - index - 1) * 5 * 60_000;
			return new Intl.DateTimeFormat("nl-NL", {
				hour: "2-digit",
				minute: "2-digit",
			}).format(Date.now() - elapsed);
		});
		chart = new Chart(historyCanvas, {
			type: "line",
			data: {
				labels,
				datasets: [{
					label: `${dataType} (${endpoint.unit})`,
					data: values,
					borderColor: endpoint.color,
					backgroundColor: `${endpoint.color}1C`,
					fill: true,
					pointRadius: 0,
					tension: 0.2,
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					legend: { display: true, labels: { color: "#fff" } },
					tooltip: { intersect: false },
				},
				scales: {
					y: {
						beginAtZero: dataType === "Luchtvochtigheid",
						title: { display: true, text: endpoint.unit, color: "#fff" },
						ticks: { color: "#fff" },
					},
					x: {
						ticks: { maxTicksLimit: 6, color: "#fff" },
					},
				},
			},
		});
	});

	function toggleData() {
		currentDataType = currentDataType === "Temperatuur" ? "Luchtvochtigheid" : "Temperatuur";
	}

	function retry() {
		retryToken += 1;
	}

	onDestroy(() => {
		requestController?.abort();
		chart?.destroy();
	});
</script>

<section class="history" aria-label={`${sensorName} meetgeschiedenis`}>
	<div class="history-heading">
		<h2>{currentDataType} · {periodLabel}</h2>
		<button
			class="history-toggle"
			type="button"
			aria-pressed={currentDataType === "Luchtvochtigheid"}
			onclick={toggleData}
		>
			Toon {currentDataType === "Temperatuur" ? "luchtvochtigheid" : "temperatuur"}
		</button>
	</div>
	{#if errorMessage}
		<div class="history-message" role="alert">
			<p>{errorMessage}</p>
			<button class="history-toggle" type="button" onclick={retry}>Opnieuw proberen</button>
		</div>
	{:else if isLoading}
		<p class="history-message" role="status">Geschiedenis laden…</p>
	{:else if !historicData?.length}
		<p class="history-message">Geen meetgeschiedenis beschikbaar voor deze periode.</p>
	{/if}
	<canvas
		bind:this={historyCanvas}
		hidden={!historicData?.length}
		aria-label={`${currentDataType} in ${periodLabel}`}
	></canvas>
</section>

<style>
	.history {
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
		color: #fff;
	}

	.history-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.history-heading h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.history-toggle {
		min-height: 40px;
		padding: 0.4rem 0.7rem;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 6px;
		background: rgba(0, 152, 121, 0.35);
		color: #fff;
		cursor: pointer;
	}

	.history-message {
		margin: 0.75rem 0;
	}
</style>
