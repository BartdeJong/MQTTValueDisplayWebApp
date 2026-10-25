<script>
	import { onMount } from "svelte";
	import MQTT from "./mqtt.js";
	import { connections, messages } from "../store.mjs";
	import { formatAge, getSensorFreshness, parseAM2301Payload } from "../utils/sensorData.mjs";

	let { topic, mqttName, broker } = $props();
	let now = $state(Date.now());
	let message = $derived($messages.find(item => item.topic === topic));
	let connection = $derived($connections[topic] || { status: "connecting", error: null });
	let readings = $derived.by(() => {
		if (!message) return null;
		try {
			return parseAM2301Payload(message.payload);
		} catch {
			return null;
		}
	});
	let freshness = $derived(getSensorFreshness(message?.receivedAt, now));
	let statusText = $derived.by(() => {
		if (message && !readings) return "Ongeldige sensorgegevens";
		if (message && freshness.state !== "fresh") {
			return `Laatste meting ${formatAge(message.receivedAt, now)}`;
		}
		if (message) return `Actueel · ${formatAge(message.receivedAt, now)}`;
		if (connection.status === "connected") return "Verbonden, wacht op eerste meting";
		if (connection.status === "error") return "Verbindingsfout";
		if (connection.status === "offline") return "Offline";
		return "Verbinding maken…";
	});
	let statusClass = $derived(`sensor-status sensor-status--${message && !readings ? "error" : message ? freshness.state : connection.status}`);
	let unavailableText = $derived.by(() => {
		if (message && !readings) return "Controleer de sensorgegevens.";
		if (connection.error) return `Verbinding mislukt: ${connection.error}`;
		return statusText;
	});

	onMount(() => {
		const mqtt = new MQTT(broker, {
			clientId: `mqtt-${Math.random().toString(36).slice(2, 17)}`,
		}, topic);
		const refreshTimer = setInterval(() => {
			now = Date.now();
		}, 30_000);

		return () => {
			clearInterval(refreshTimer);
			mqtt.disconnect();
		};
	});
</script>

<tr class:sensor-row--stale={message && freshness.state !== "fresh"}>
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
