<script>
	import { onMount } from "svelte";
	import MQTT from "./mqtt.js";
	import { connections, messages } from "../store.mjs";
	import { formatAge, getSensorFreshness, parseNumericReading } from "../utils/sensorData.mjs";

	let { topic, mqttName, broker } = $props();
	let now = $state(Date.now());
	let temperatureMessage = $derived($messages.find(item => item.topic === `${topic}/temperature`));
	let humidityMessage = $derived($messages.find(item => item.topic === `${topic}/humidity`));
	let latestMessage = $derived.by(() => {
		return [temperatureMessage, humidityMessage]
			.filter(Boolean)
			.sort((left, right) => right.receivedAt - left.receivedAt)[0] || null;
	});
	let connection = $derived($connections[topic] || { status: "connecting", error: null });
	let freshness = $derived(getSensorFreshness(latestMessage?.receivedAt, now));
	let readings = $derived.by(() => {
		if (!temperatureMessage || !humidityMessage) return null;
		try {
			return {
				temperature: parseNumericReading(temperatureMessage.payload),
				humidity: parseNumericReading(humidityMessage.payload),
			};
		} catch {
			return null;
		}
	});
	let statusText = $derived.by(() => {
		if (latestMessage && freshness.state !== "fresh") {
			return `Laatste meting ${formatAge(latestMessage.receivedAt, now)}`;
		}
		if (latestMessage) return `Actueel · ${formatAge(latestMessage.receivedAt, now)}`;
		if (connection.status === "connected") return "Verbonden, wacht op eerste meting";
		if (connection.status === "error") return "Verbindingsfout";
		if (connection.status === "offline") return "Offline";
		return "Verbinding maken…";
	});
	let statusClass = $derived(`sensor-status sensor-status--${latestMessage ? freshness.state : connection.status}`);
	let unavailableText = $derived.by(() => {
		if (!temperatureMessage || !humidityMessage) {
			return latestMessage ? "Wachten op temperatuur en luchtvochtigheid." : statusText;
		}
		return "Controleer de sensorgegevens.";
	});

	onMount(() => {
		const mqtt = new MQTT(broker, {
			clientId: `mqtt-${Math.random().toString(36).slice(2, 17)}`,
		}, `${topic}/#`, topic);
		const refreshTimer = setInterval(() => {
			now = Date.now();
		}, 30_000);

		return () => {
			clearInterval(refreshTimer);
			mqtt.disconnect();
		};
	});
</script>

<tr class:sensor-row--stale={latestMessage && freshness.state !== "fresh"}>
	<td>
		<div>{mqttName}</div>
		<small class={statusClass} role="status">{statusText}</small>
	</td>
	{#if readings}
		<td class="largeText">{readings.temperature} °C</td>
		<td class="largeText">{readings.humidity} %</td>
	{:else}
		<td colspan="2">{unavailableText}</td>
	{/if}
</tr>
