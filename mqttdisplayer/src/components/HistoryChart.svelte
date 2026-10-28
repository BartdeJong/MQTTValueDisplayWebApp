<script>
	import { onDestroy } from "svelte";
	import { getSensorReadings } from "../utils/sensorApi.mjs";

	const HISTORY_SERIES = [
		{
			key: "temperature",
			title: "Temperatuur",
			unit: "°C",
			color: "#087e73",
		},
		{
			key: "humidity",
			title: "Luchtvochtigheid",
			unit: "%",
			color: "#6388cf",
		},
	];
	const PERIOD_LABELS = {
		24: "2 uur",
		288: "1 dag",
		2016: "1 week",
		8640: "30 dagen",
		25920: "90 dagen",
	};
	const RETRY_DELAYS_MS = [1000, 3000];
	const SAMPLE_INTERVAL_MS = 5 * 60_000;
	const DAY_MS = 24 * 60 * 60_000;
	const AGGREGATION_INTERVAL_MS = {
		raw: SAMPLE_INTERVAL_MS,
		hour: 60 * 60_000,
		day: DAY_MS,
	};

	let { sensorName, period, customFrom, customTo } = $props();
	let historicData = $state({ temperature: null, humidity: null });
	let historyInterval = $state("raw");
	let historyDataMode = $state("raw");
	let selectedTimestamp = $state(null);
	let isLoading = $state(false);
	let errorMessage = $state("");
	let retryToken = $state(0);
	let requestController;

	const periodLabel = $derived(
		PERIOD_LABELS[Number(period)] || (period === "custom" ? "Aangepaste periode" : "aangepaste periode")
	);
	const historyDescription = $derived.by(() => {
		if (historyDataMode !== "sampled") return "";
		return historyInterval === "hour" ? " · steekproef per uur" : " · dagelijkse steekproef";
	});
	const selectedRangeDuration = $derived.by(() => {
		if (period !== "custom") return Number(period) * SAMPLE_INTERVAL_MS;
		const from = Date.parse(`${customFrom}T00:00:00Z`);
		const to = Date.parse(`${customTo}T23:59:59Z`);
		return to - from;
	});
	const chartModel = $derived.by(() => {
		const hasReadings = HISTORY_SERIES.some(series => historicData[series.key]?.length);
		if (!hasReadings) return null;

		const now = Date.now();
		const expectedDuration = Number.isFinite(selectedRangeDuration) && selectedRangeDuration > 0
			? selectedRangeDuration
			: SAMPLE_INTERVAL_MS;
		const expectedInterval = AGGREGATION_INTERVAL_MS[historyInterval] || SAMPLE_INTERVAL_MS;
		const maxGap = expectedInterval * 2.5;
		const maxMatchDistance = expectedInterval * 3;
		const readingsBySeries = HISTORY_SERIES.map(series => {
			const readings = historicData[series.key] || [];
			const timestamps = readings.map(reading => reading.timestamp);
			const hasUsefulTimestamps = timestamps.length > 0 && timestamps.every(Number.isFinite);
			const chartReadings = readings.map((reading, index) => ({
				...reading,
				chartTimestamp: hasUsefulTimestamps
					? reading.timestamp
					: now - (readings.length - index - 1) * SAMPLE_INTERVAL_MS,
			})).sort((left, right) => left.chartTimestamp - right.chartTimestamp);
			return { ...series, readings: chartReadings };
		});
		const timestamps = readingsBySeries.flatMap(series =>
			series.readings.map(reading => reading.chartTimestamp)
		);
		let domainStart = Math.min(...timestamps);
		let domainEnd = Math.max(...timestamps);
		if (domainEnd === domainStart) domainStart = domainEnd - expectedDuration;

		const timeline = [...new Set(timestamps)].sort((left, right) => left - right);
		const selectedTime = selectedTimestamp ?? domainEnd;
		const nearestTime = timeline.reduce((nearest, timestamp) =>
			Math.abs(timestamp - selectedTime) < Math.abs(nearest - selectedTime) ? timestamp : nearest
		);
		const selectedIndex = timeline.indexOf(nearestTime);
		const plot = { left: 43, right: 350, top: 12, bottom: 108 };
		const numberFormat = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
		const timeFormat = new Intl.DateTimeFormat("nl-NL", expectedDuration >= 7 * DAY_MS
			? { day: "2-digit", month: "short" }
			: expectedDuration >= DAY_MS
				? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
				: { hour: "2-digit", minute: "2-digit" });
		const dateTimeFormat = new Intl.DateTimeFormat("nl-NL", {
			dateStyle: "medium",
			timeStyle: "short",
		});
		const xForTimestamp = timestamp =>
			plot.left + ((timestamp - domainStart) / (domainEnd - domainStart)) * (plot.right - plot.left);
		const xTickCount = expectedDuration >= DAY_MS && expectedDuration < 7 * DAY_MS ? 4 : 5;
		const xTicks = Array.from({ length: xTickCount }, (_, index) => {
			const timestamp = domainStart + ((domainEnd - domainStart) * index) / (xTickCount - 1);
			return { x: xForTimestamp(timestamp), label: timeFormat.format(timestamp) };
		});
		const charts = readingsBySeries.map(series => {
			const values = series.readings.map(reading => reading.value);
			const minimumValues = series.readings.map(reading => reading.minimum ?? reading.value);
			const maximumValues = series.readings.map(reading => reading.maximum ?? reading.value);
			const valueMin = minimumValues.length ? Math.min(...minimumValues) : 0;
			const valueMax = maximumValues.length ? Math.max(...maximumValues) : 1;
			const padding = Math.max((valueMax - valueMin) * 0.12, 0.5);
			const minValue = !values.length || series.key === "humidity" ? 0 : valueMin - padding;
			const maxValue = !values.length ? 1 : series.key === "humidity" ? 100 : valueMax + padding;
			const valueSpan = maxValue - minValue || 1;
			const yForValue = value =>
				plot.bottom - ((value - minValue) / valueSpan) * (plot.bottom - plot.top);
			const yTicks = Array.from({ length: 5 }, (_, index) => {
				const value = maxValue - (valueSpan * index) / 4;
				return {
					y: plot.top + ((plot.bottom - plot.top) * index) / 4,
					label: numberFormat.format(value),
				};
			});
			const points = series.readings.map(reading => ({
				x: xForTimestamp(reading.chartTimestamp),
				y: yForValue(reading.value),
				timestamp: reading.chartTimestamp,
				value: reading.value,
			}));
			const segments = [];
			let segment = [];
			for (const point of points) {
				if (segment.length && point.timestamp - segment.at(-1).timestamp > maxGap) {
					segments.push(segment);
					segment = [];
				}
				segment.push(point);
			}
			if (segment.length) segments.push(segment);
			const linePaths = segments
				.filter(pointsInSegment => pointsInSegment.length > 1)
				.map(pointsInSegment => pointsInSegment.map((point, index) =>
					`${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
				).join(" "));
			const latest = series.readings.at(-1);
			const selectedReading = series.readings.reduce((nearest, reading) =>
				!nearest || Math.abs(reading.chartTimestamp - nearestTime) <
					Math.abs(nearest.chartTimestamp - nearestTime) ? reading : nearest
			, null);
			const selectedPoint = selectedReading &&
				Math.abs(selectedReading.chartTimestamp - nearestTime) <= maxMatchDistance
				? {
					x: xForTimestamp(selectedReading.chartTimestamp),
					y: yForValue(selectedReading.value),
					value: selectedReading.value,
				}
				: null;

			return {
				...series,
				plot,
				yTicks,
				xTicks,
				linePaths,
				latest: latest ? numberFormat.format(latest.value) : "—",
				min: values.length ? numberFormat.format(valueMin) : "—",
				average: values.length
					? numberFormat.format(series.readings.reduce(
						(sum, reading) => sum + reading.value * (reading.sampleCount || 1),
						0
					) / series.readings.reduce(
						(count, reading) => count + (reading.sampleCount || 1),
						0
					))
					: "—",
				max: values.length ? numberFormat.format(valueMax) : "—",
				cursorX: xForTimestamp(nearestTime),
				selectedPoint,
			};
		});

		return {
			charts,
			timeline,
			selectedIndex,
			selectedTimeLabel: dateTimeFormat.format(nearestTime),
			startTimeLabel: timeFormat.format(domainStart),
			endTimeLabel: timeFormat.format(domainEnd),
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

	function getHistoryRange(requestPeriod, requestCustomFrom, requestCustomTo) {
		if (requestPeriod === "custom") {
			const start = Date.parse(`${requestCustomFrom}T00:00:00Z`);
			const end = Date.parse(`${requestCustomTo}T23:59:59Z`);
			const selectedDays = (
				Date.parse(`${requestCustomTo}T00:00:00Z`) -
				Date.parse(`${requestCustomFrom}T00:00:00Z`)
			) / DAY_MS + 1;
			if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
				throw new Error("Kies een geldige start- en einddatum.");
			}
			if (selectedDays > 90) {
				throw new Error("Kies een periode van maximaal 90 dagen.");
			}
			const now = new Date();
			const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
				.toISOString()
				.slice(0, 10);
			if (requestCustomTo > today) {
				throw new Error("De einddatum mag niet in de toekomst liggen.");
			}
			return {
				from: new Date(start).toISOString(),
				to: new Date(end).toISOString(),
			};
		}

		const duration = Number(requestPeriod) * SAMPLE_INTERVAL_MS;
		if (!Number.isFinite(duration) || duration <= 0) {
			throw new Error("Kies een geldige geschiedenisperiode.");
		}
		const to = Date.now();
		return {
			from: new Date(to - duration).toISOString(),
			to: new Date(to).toISOString(),
		};
	}

	async function fetchHistoricalReadings(requestSensor, range, signal) {
		let lastError;

		for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
			try {
				return await getSensorReadings(requestSensor, range.from, range.to, { signal });
			} catch (error) {
				if (error.name === "AbortError" || signal.aborted) throw error;
				if (error.status && ![408, 429].includes(error.status) && error.status < 500) {
					throw error;
				}
				lastError = error;
				if (attempt === RETRY_DELAYS_MS.length) break;
				await waitForRetry(RETRY_DELAYS_MS[attempt], signal);
			}
		}

		throw lastError || new Error("De historie-server is niet beschikbaar.");
	}

	$effect(() => {
		const requestSensor = sensorName;
		const requestPeriod = period;
		const requestCustomFrom = customFrom;
		const requestCustomTo = customTo;
		retryToken;
		const controller = new AbortController();
		requestController = controller;
		historicData = { temperature: null, humidity: null };
		historyInterval = "raw";
		historyDataMode = "raw";
		selectedTimestamp = null;
		isLoading = true;
		errorMessage = "";

		async function loadHistory() {
			try {
				const range = getHistoryRange(requestPeriod, requestCustomFrom, requestCustomTo);
				const result = await fetchHistoricalReadings(
					requestSensor,
					range,
					controller.signal
				);
				if (!controller.signal.aborted) {
					historyInterval = result.interval;
					historyDataMode = result.dataMode;
					historicData = {
						temperature: result.readings.map(reading => ({
							value: reading.temperature,
							minimum: reading.temperatureMin,
							maximum: reading.temperatureMax,
							sampleCount: reading.sampleCount,
							timestamp: Date.parse(reading.timestamp),
						})),
						humidity: result.readings.map(reading => ({
							value: reading.humidity,
							minimum: reading.humidityMin,
							maximum: reading.humidityMax,
							sampleCount: reading.sampleCount,
							timestamp: Date.parse(reading.timestamp),
						})),
					};
				}
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

	function selectTimeline(event, timeline) {
		selectedTimestamp = timeline[Number(event.currentTarget.value)];
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
		<div>
			<h2>Meetgeschiedenis</h2>
			<p>{periodLabel}{historyDescription}</p>
		</div>
	</div>
	{#if errorMessage}
		<div class="history-message" role="alert">
			<p>{errorMessage}</p>
			<button class="history-retry" type="button" onclick={retry}>Opnieuw proberen</button>
		</div>
	{:else if isLoading}
		<p class="history-message" role="status">Geschiedenis laden; dit kan even duren…</p>
	{:else if !HISTORY_SERIES.some(series => historicData[series.key]?.length)}
		<p class="history-message">Geen meetgeschiedenis beschikbaar voor deze periode.</p>
	{/if}
	{#if chartModel}
		<div class="history-charts">
			{#each chartModel.charts as chart, chartIndex (chart.key)}
				<section class="metric-history" aria-label={`${chart.title} geschiedenis`}>
					<header class="metric-heading">
						<h3>
							<span class="metric-color" style={`--series-color: ${chart.color}`} aria-hidden="true"></span>
							{chart.title}
						</h3>
						<strong>{chart.latest} {chart.unit}</strong>
					</header>
					<dl class="metric-stats">
						<div><dt>{historyDataMode === "sampled" ? "Steekproef min" : "Min"}</dt><dd>{chart.min} {chart.unit}</dd></div>
						<div><dt>{historyDataMode === "sampled" ? "Steekproef gem." : "Gem."}</dt><dd>{chart.average} {chart.unit}</dd></div>
						<div><dt>{historyDataMode === "sampled" ? "Steekproef max" : "Max"}</dt><dd>{chart.max} {chart.unit}</dd></div>
						<div><dt>{historyDataMode === "sampled" ? "Laatste steekproef" : "Laatste"}</dt><dd>{chart.latest} {chart.unit}</dd></div>
					</dl>
					<svg
						class="history-chart"
						viewBox="0 0 360 148"
						role="img"
						aria-label={`${chart.title}, van ${chart.min} tot ${chart.max} ${chart.unit}`}
					>
						<g class="chart-grid" aria-hidden="true">
							{#each chart.yTicks as tick (tick.y)}
								<line x1={chart.plot.left} x2={chart.plot.right} y1={tick.y} y2={tick.y} />
								<text x={chart.plot.left - 7} y={tick.y + 3} text-anchor="end">{tick.label}</text>
							{/each}
						</g>
						{#each chart.linePaths as linePath, index (`${chart.key}-${index}`)}
							<path class="chart-line" d={linePath} stroke={chart.color} />
						{/each}
						<line
							class="chart-cursor"
							x1={chart.cursorX}
							x2={chart.cursorX}
							y1={chart.plot.top}
							y2={chart.plot.bottom}
						/>
						{#if chart.selectedPoint}
							<circle
								class="chart-selected"
								cx={chart.selectedPoint.x}
								cy={chart.selectedPoint.y}
								r="4"
								fill={chart.color}
							/>
						{/if}
						{#if chartIndex === chartModel.charts.length - 1}
							<g class="chart-times" aria-hidden="true">
								{#each chart.xTicks as tick, index (`${tick.x}-${index}`)}
									<text
										x={tick.x}
										y="140"
										text-anchor={index === 0 ? "start" : index === chart.xTicks.length - 1 ? "end" : "middle"}
									>
										{tick.label}
									</text>
								{/each}
							</g>
						{/if}
					</svg>
				</section>
			{/each}

			<div class="history-inspector">
				<div class="inspector-heading">
					<label for={`history-time-${sensorName}`}>Bekijk meetmoment</label>
					<output>{chartModel.selectedTimeLabel}</output>
				</div>
				<input
					class="history-range"
					id={`history-time-${sensorName}`}
					type="range"
					min="0"
					max={chartModel.timeline.length - 1}
					value={chartModel.selectedIndex}
					aria-valuetext={chartModel.selectedTimeLabel}
					oninput={event => selectTimeline(event, chartModel.timeline)}
				/>
				<div class="range-ends" aria-hidden="true">
					<span>{chartModel.startTimeLabel}</span>
					<span>{chartModel.endTimeLabel}</span>
				</div>
				<div class="selected-readings" aria-live="polite">
					<strong>Op dit moment</strong>
					{#each chartModel.charts as chart (chart.key)}
						<span>
							<span class="metric-color" style={`--series-color: ${chart.color}`} aria-hidden="true"></span>
							{chart.title}: {chart.selectedPoint ? `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(chart.selectedPoint.value)} ${chart.unit}` : "geen meting"}
						</span>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	.history {
		min-width: 0;
		padding: 0.85rem;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: #fff;
		color: var(--color-ink);
	}

	.history-heading {
		display: flex;
		align-items: flex-start;
		margin-bottom: 0.4rem;
	}

	.history-heading h2 {
		margin: 0;
		font-size: 1rem;
	}

	.history-heading p {
		margin: 0.2rem 0 0;
		color: var(--color-muted);
		font-size: 0.82rem;
	}

	.history-charts {
		display: grid;
		min-width: 0;
	}

	.history-message {
		margin: 0.7rem 0;
		font-size: 0.86rem;
	}

	.history-retry {
		min-height: 40px;
		padding: 0.4rem 0.8rem;
		border: 1px solid #dceae6;
		border-radius: 999px;
		background: #edf6f3;
		color: var(--color-primary-dark);
		font: inherit;
		font-size: 0.84rem;
		font-weight: 650;
		cursor: pointer;
	}

	.metric-history {
		min-width: 0;
		padding-top: 0.65rem;
		border-top: 1px solid #e8f0ed;
	}

	.metric-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.metric-heading h3 {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.45rem;
		margin: 0;
		font-size: 0.9rem;
	}

	.metric-heading strong {
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.metric-color {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		flex: 0 0 auto;
		border-radius: 50%;
		background: var(--series-color);
	}

	.metric-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.25rem;
		margin: 0.45rem 0 0;
	}

	.metric-stats div {
		min-width: 0;
	}

	.metric-stats dt {
		color: var(--color-muted);
		font-size: 0.68rem;
	}

	.metric-stats dd {
		margin: 0.1rem 0 0;
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.history-chart {
		display: block;
		width: 100%;
		height: auto;
	}

	.chart-grid line {
		stroke: #e5eeeb;
		stroke-width: 1;
	}

	.chart-grid text {
		fill: #748683;
		font-family: inherit;
		font-size: 10px;
	}

	.chart-times text {
		fill: #748683;
		font-family: inherit;
		font-size: 10px;
	}

	.chart-line {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 2.5;
		vector-effect: non-scaling-stroke;
	}

	.chart-cursor {
		stroke: #899a97;
		stroke-dasharray: 3 3;
		stroke-width: 1.25;
		vector-effect: non-scaling-stroke;
	}

	.chart-selected {
		stroke: white;
		stroke-width: 2;
		vector-effect: non-scaling-stroke;
	}

	.history-inspector {
		margin-top: 0.4rem;
		padding: 0.65rem;
		border: 1px solid #e8f0ed;
		border-radius: 12px;
		background: #f8fbfa;
	}

	.inspector-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.8rem;
	}

	.inspector-heading label {
		font-weight: 650;
	}

	.inspector-heading output {
		color: var(--color-muted);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.history-range {
		display: block;
		width: 100%;
		min-height: 36px;
		margin: 0.15rem 0 0;
		accent-color: var(--color-primary);
		cursor: pointer;
		touch-action: pan-y;
	}

	.range-ends {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: -0.25rem;
		color: var(--color-muted);
		font-size: 0.68rem;
		font-variant-numeric: tabular-nums;
	}

	.selected-readings {
		display: grid;
		gap: 0.35rem;
		margin-top: 0.55rem;
		font-size: 0.76rem;
	}

	.selected-readings > strong {
		font-size: 0.72rem;
	}

	.selected-readings > span {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	@media (max-width: 380px) {
		.history {
			padding: 0.65rem;
		}

		.metric-stats {
			gap: 0.1rem;
		}

		.metric-stats dd {
			font-size: 0.68rem;
		}
	}
</style>
