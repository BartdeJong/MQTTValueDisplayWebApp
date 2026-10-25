<script>
	import { onDestroy } from "svelte";
	import { parseHistoricalReadings } from "../utils/sensorData.mjs";

	const HISTORY_ENDPOINTS = {
		Temperatuur: {
			type: "temps",
			apiId: "4dq0cg8znc",
			unit: "°C",
			color: "#087e73",
		},
		Luchtvochtigheid: {
			type: "hums",
			apiId: "6oewbmsm96",
			unit: "%",
			color: "#6388cf",
		},
	};

	const PERIOD_LABELS = { 24: "2 uur", 288: "1 dag", 2016: "1 week" };
	const RETRY_DELAYS_MS = [1000, 3000];

	let { sensorName, period } = $props();
	let historicData = $state(null);
	let currentDataType = $state("Temperatuur");
	let isLoading = $state(false);
	let errorMessage = $state("");
	let retryToken = $state(0);
	let requestController;

	const periodLabel = $derived(PERIOD_LABELS[Number(period)] || "aangepaste periode");
	const chartModel = $derived.by(() => {
		if (!historicData?.length) return null;

		const dataType = currentDataType;
		const endpoint = HISTORY_ENDPOINTS[dataType];
		const timestamps = historicData.map(reading => reading.timestamp);
		const timestampRange = timestamps.reduce(
			(range, timestamp) => [
				Math.min(range[0], timestamp),
				Math.max(range[1], timestamp),
			],
			[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
		);
		const expectedDuration = Number(period) * 5 * 60_000;
		const hasUsefulTimestamps = timestamps.every(Number.isFinite) &&
			new Set(timestamps).size > 1 &&
			timestampRange[1] - timestampRange[0] >= expectedDuration / 2;
		const readings = hasUsefulTimestamps
			? [...historicData].sort((left, right) => left.timestamp - right.timestamp)
			: historicData;
		const chartReadings = readings.map((reading, index) => ({
			...reading,
			chartTimestamp: hasUsefulTimestamps
				? reading.timestamp
				: Date.now() - (readings.length - index - 1) * 5 * 60_000,
		}));

		const plot = { left: 76, right: 696, top: 22, bottom: 218 };
		const valueRange = readings.reduce(
			(range, reading) => ({
				min: Math.min(range.min, reading.value),
				max: Math.max(range.max, reading.value),
			}),
			{ min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
		);
		const valuePadding = Math.max((valueRange.max - valueRange.min) * 0.08, 1);
		const minValue = dataType === "Luchtvochtigheid"
			? 0
			: valueRange.min - valuePadding;
		const maxValue = valueRange.max + valuePadding;
		const valueSpan = maxValue - minValue || 1;
		const points = chartReadings.map((reading, index) => ({
			x: plot.left + (chartReadings.length === 1
				? 0
				: (index / (chartReadings.length - 1)) * (plot.right - plot.left)),
			y: plot.bottom - ((reading.value - minValue) / valueSpan) * (plot.bottom - plot.top),
		}));
		const linePath = points
			.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
			.join(" ");
		const areaPath = points.length
			? `${linePath} L ${points.at(-1).x.toFixed(2)} ${plot.bottom} L ${points[0].x.toFixed(2)} ${plot.bottom} Z`
			: "";
		const numberFormat = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
		const yTicks = Array.from({ length: 5 }, (_, index) => {
			const value = maxValue - (valueSpan * index) / 4;
			return {
				value,
				y: plot.top + ((plot.bottom - plot.top) * index) / 4,
				label: numberFormat.format(value),
			};
		});
		const timeFormat = new Intl.DateTimeFormat("nl-NL", {
			...(Number(period) >= 2016 && { day: "2-digit", month: "short" }),
			hour: "2-digit",
			minute: "2-digit",
		});
		const xTickCount = Math.min(6, chartReadings.length);
		const xTicks = Array.from({ length: xTickCount }, (_, index) => {
			const readingIndex = xTickCount === 1
				? 0
				: Math.round((index / (xTickCount - 1)) * (chartReadings.length - 1));
			return {
				x: points[readingIndex].x,
				label: timeFormat.format(chartReadings[readingIndex].chartTimestamp),
			};
		});
		const latest = chartReadings.at(-1);

		return {
			dataType,
			unit: endpoint.unit,
			color: endpoint.color,
			periodLabel,
			plot,
			linePath,
			areaPath,
			yTicks,
			xTicks,
			latest: {
				x: points.at(-1).x,
				y: points.at(-1).y,
				label: `${numberFormat.format(latest.value)} ${endpoint.unit}`,
			},
		};
	});

	function waitForRetry(delayMs, signal) {
		return new Promise((resolve, reject) => {
			if (signal.aborted) {
				reject(new DOMException("De aanvraag is geannuleerd.", "AbortError"));
				return;
			}

			const timer = setTimeout(() => {
				signal.removeEventListener("abort", onAbort);
				resolve();
			}, delayMs);
			const onAbort = () => {
				clearTimeout(timer);
				reject(new DOMException("De aanvraag is geannuleerd.", "AbortError"));
			};
			signal.addEventListener("abort", onAbort, { once: true });
		});
	}

	async function fetchHistoricalReadings(url, requestBody, signal) {
		let lastError;

		for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
			let response;
			try {
				response = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(requestBody),
					signal,
				});
			} catch (error) {
				if (error.name === "AbortError" || signal.aborted) throw error;
				lastError = error;
				if (attempt === RETRY_DELAYS_MS.length) break;
				await waitForRetry(RETRY_DELAYS_MS[attempt], signal);
				continue;
			}

			if (!response.ok) {
				lastError = new Error(`De historie-server antwoordde met status ${response.status}.`);
				if (![408, 429].includes(response.status) && response.status < 500) {
					throw lastError;
				}
				if (attempt === RETRY_DELAYS_MS.length) break;
				await waitForRetry(RETRY_DELAYS_MS[attempt], signal);
				continue;
			}

			return parseHistoricalReadings(await response.text());
		}

		throw lastError || new Error("De historie-server is niet beschikbaar.");
	}

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
				const readings = await fetchHistoricalReadings(
					`https://${endpoint.apiId}.execute-api.eu-central-1.amazonaws.com/prod/read-last-${endpoint.type}-cdk`,
					{
						sensor_name: requestSensor,
						record_amount: requestPeriod,
					},
					controller.signal
				);
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

	function toggleData() {
		currentDataType = currentDataType === "Temperatuur" ? "Luchtvochtigheid" : "Temperatuur";
	}

	function retry() {
		retryToken += 1;
	}

	onDestroy(() => {
		requestController?.abort();
	});
</script>

<section class="history" aria-label={`${sensorName} meetgeschiedenis`}>
	<div class="history-heading">
		<h2>{currentDataType} ({HISTORY_ENDPOINTS[currentDataType].unit}) · {periodLabel}</h2>
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
		<p class="history-message" role="status">Geschiedenis laden; dit kan even duren…</p>
	{:else if !historicData?.length}
		<p class="history-message">Geen meetgeschiedenis beschikbaar voor deze periode.</p>
	{/if}
	{#if chartModel}
		<div class="chart-shell">
			<svg
				class="history-chart"
				viewBox="0 0 720 280"
				role="img"
				aria-label={`${chartModel.dataType} in ${chartModel.periodLabel}`}
			>
				<title>{chartModel.dataType} · {chartModel.periodLabel}</title>
				<g class="chart-grid" aria-hidden="true">
					{#each chartModel.yTicks as tick (tick.y)}
						<line x1={chartModel.plot.left} x2={chartModel.plot.right} y1={tick.y} y2={tick.y} />
						<text x={chartModel.plot.left - 12} y={tick.y + 4} text-anchor="end">{tick.label}</text>
					{/each}
				</g>
				<path class="chart-area" d={chartModel.areaPath} fill={`${chartModel.color}18`} />
				<path class="chart-line" d={chartModel.linePath} stroke={chartModel.color} />
				<circle
					class="chart-latest"
					cx={chartModel.latest.x}
					cy={chartModel.latest.y}
					r="5"
					fill={chartModel.color}
				>
					<title>Laatste meting: {chartModel.latest.label}</title>
				</circle>
				<g class="chart-times" aria-hidden="true">
					{#each chartModel.xTicks as tick, index (`${tick.x}-${index}`)}
						<text x={tick.x} y="254" text-anchor={index === 0 ? "start" : index === chartModel.xTicks.length - 1 ? "end" : "middle"}>
							{tick.label}
						</text>
					{/each}
				</g>
			</svg>
		</div>
	{/if}
</section>

<style>
	.history {
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		background: #fff;
		color: var(--color-ink);
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
		border: 1px solid #dceae6;
		border-radius: 999px;
		background: #edf6f3;
		color: var(--color-primary-dark);
		font-size: 0.86rem;
		font-weight: 650;
		cursor: pointer;
	}

	.history-toggle:hover {
		border-color: #acd2ca;
		background: #e4f2ed;
	}

	.history-message {
		margin: 0.75rem 0;
	}

	.chart-shell {
		margin-top: 0.75rem;
		padding: 0.6rem 0.25rem 0;
		overflow: hidden;
		border: 1px solid #e8f0ed;
		border-radius: 14px;
		background: linear-gradient(180deg, #fbfdfc, #f7faf9);
	}

	.history-chart {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.chart-grid line {
		stroke: #e5eeeb;
		stroke-dasharray: 3 5;
		stroke-width: 1;
	}

	.chart-grid text,
	.chart-times text {
		fill: #748683;
		font-family: inherit;
		font-size: 15px;
	}

	.chart-area {
		stroke: none;
	}

	.chart-line {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 3;
		vector-effect: non-scaling-stroke;
	}

	.chart-latest {
		stroke: white;
		stroke-width: 2.5;
		vector-effect: non-scaling-stroke;
	}
</style>
