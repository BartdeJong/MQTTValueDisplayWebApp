<script>
	import { onMount } from "svelte";
	import { DEFAULT_LOCATIONS, parseLocationsCookie } from "../utils/locations.mjs";
	import SensorRow from "./SensorRow.svelte";

	const DEFAULT_BACKGROUND = `${import.meta.env.BASE_URL}img/background.jpeg`;
	const MAX_BACKGROUND_BYTES = 10 * 1024 * 1024;
	const MAX_BACKGROUND_DIMENSION = 1280;

	let { onManageLocations } = $props();
	let locations = $state(DEFAULT_LOCATIONS.map(location => ({ ...location })));
	let locationsError = $state("");
	let recordAmount = $state(288);
	let backgroundImageUrl = $state(DEFAULT_BACKGROUND);
	let backgroundError = $state("");
	let backgroundSaved = $state("");

	onMount(() => {
		try {
			backgroundImageUrl = localStorage.getItem("userBackgroundImage") || DEFAULT_BACKGROUND;
		} catch (error) {
			backgroundError = "Lokale opslag is niet beschikbaar; de standaardachtergrond wordt gebruikt.";
			console.error("Saved background could not be loaded:", error);
		}

		try {
			const savedLocations = parseLocationsCookie(document.cookie);
			if (savedLocations) locations = savedLocations;
		} catch (error) {
			locationsError = `${error.message} De standaardlocaties worden getoond.`;
			console.error("Saved locations could not be loaded:", error);
		}
	});

	async function handleBackgroundUpload(event) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		backgroundError = "";
		backgroundSaved = "";
		if (!file) return;

		try {
			if (!file.type.startsWith("image/")) {
				throw new Error("Kies een afbeeldingsbestand.");
			}
			if (file.size > MAX_BACKGROUND_BYTES) {
				throw new Error("De afbeelding is groter dan 10 MB.");
			}

			const objectUrl = URL.createObjectURL(file);
			const image = new Image();
			try {
				await new Promise((resolve, reject) => {
					image.onload = resolve;
					image.onerror = () => reject(new Error("De afbeelding kan niet worden geopend."));
					image.src = objectUrl;
				});
			} finally {
				URL.revokeObjectURL(objectUrl);
			}

			const scale = Math.min(
				1,
				MAX_BACKGROUND_DIMENSION / image.width,
				MAX_BACKGROUND_DIMENSION / image.height
			);
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(image.width * scale));
			canvas.height = Math.max(1, Math.round(image.height * scale));
			const context = canvas.getContext("2d");
			if (!context) throw new Error("De afbeelding kon niet worden verwerkt.");
			context.drawImage(image, 0, 0, canvas.width, canvas.height);

			const compressedImage = canvas.toDataURL("image/jpeg", 0.7);
			localStorage.setItem("userBackgroundImage", compressedImage);
			backgroundImageUrl = compressedImage;
			backgroundSaved = "De achtergrond is opgeslagen op dit apparaat.";
		} catch (error) {
			backgroundError = error.name === "QuotaExceededError"
				? "Er is onvoldoende opslagruimte om deze achtergrond op te slaan."
				: error.message || "De achtergrond kon niet worden opgeslagen.";
			console.error("Background image could not be saved:", error);
		} finally {
			input.value = "";
		}
	}

	function resetBackground() {
		backgroundError = "";
		backgroundSaved = "";
		try {
			localStorage.removeItem("userBackgroundImage");
			backgroundImageUrl = DEFAULT_BACKGROUND;
			backgroundSaved = "De standaardachtergrond is hersteld.";
		} catch (error) {
			backgroundError = "De opgeslagen achtergrond kon niet worden verwijderd.";
			console.error("Background image could not be reset:", error);
		}
	}
</script>

<main class="home sizeUp" style={`--dashboard-background: url(${JSON.stringify(backgroundImageUrl)})`}>
	<section class="table-container" aria-labelledby="sensor-table-title">
		<h1 id="sensor-table-title" class="visually-hidden">Temperatuur en luchtvochtigheid</h1>
		<table class="styled-table">
			<caption class="visually-hidden">Temperatuur en luchtvochtigheid van de ingestelde locaties</caption>
			<colgroup>
				<col class="location-column">
				<col class="temperature-column">
				<col class="humidity-column">
			</colgroup>
			<thead>
				<tr>
					<th scope="col"><span class="visually-hidden">Locatie</span></th>
					<th scope="col">
						<img src={`${import.meta.env.BASE_URL}img/temperature.png`} alt="Temperatuur" class="heading-image">
					</th>
					<th scope="col">
						<img src={`${import.meta.env.BASE_URL}img/humidity.png`} alt="Luchtvochtigheid" class="heading-image">
					</th>
				</tr>
			</thead>
			{#each locations as location (location.deviceId)}
				<SensorRow name={location.name} deviceId={location.deviceId} period={recordAmount} />
			{:else}
				<tbody>
					<tr>
						<td colspan="3">Geen locaties ingesteld. Voeg een locatie toe via Locaties beheren.</td>
					</tr>
				</tbody>
			{/each}
		</table>
	</section>

	<section class="control-panel" aria-labelledby="settings-title">
		<h2 id="settings-title">Instellingen</h2>
		<div class="control-field">
			<label for="date-select">Geschiedenis weergeven over</label>
			<select id="date-select" bind:value={recordAmount}>
				<option value={24}>2 uur</option>
				<option value={288}>1 dag</option>
				<option value={2016}>1 week</option>
			</select>
		</div>
		<button class="styled-button" type="button" onclick={onManageLocations}>
			Locaties beheren
		</button>
		<label class="styled-button upload-wrapper" for="background-upload">
			📁 Achtergrondafbeelding kiezen
			<input
				id="background-upload"
				type="file"
				accept="image/*"
				onchange={handleBackgroundUpload}
			>
		</label>
		<button class="styled-button" type="button" onclick={resetBackground}>
			Standaardachtergrond herstellen
		</button>
		{#if backgroundError}
			<p class="feedback feedback--error" role="alert">{backgroundError}</p>
		{:else if backgroundSaved}
			<p class="feedback" role="status">{backgroundSaved}</p>
		{/if}
		{#if locationsError}
			<p class="feedback feedback--error" role="alert">{locationsError}</p>
		{/if}
	</section>
</main>

<style>
	.home {
		min-height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background-color: #171717;
		background-image: var(--dashboard-background);
		background-position: center;
		background-size: cover;
		background-repeat: no-repeat;
		background-attachment: fixed;
		transition: background-image 0.25s ease-in-out;
	}

	.table-container {
		width: 100%;
		max-width: 900px;
		overflow-x: auto;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.22);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
	}

	.styled-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		background: rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(8px);
		border-radius: 12px;
		overflow: hidden;
	}

	.location-column {
		width: 45%;
	}

	.temperature-column {
		width: 28%;
	}

	.humidity-column {
		width: 27%;
	}

	.styled-table th,
	.styled-table td {
		padding: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		overflow-wrap: anywhere;
		text-align: center;
	}

	.styled-table th {
		background: rgba(0, 152, 121, 0.35);
		color: #fff;
	}

	.styled-table tbody {
		background: rgba(25, 25, 25, 0.72);
		color: #fff;
	}

	.styled-table tbody tr:nth-child(even) {
		background: rgba(255, 255, 255, 0.07);
	}

	.styled-table tbody tr:last-child td {
		border-bottom: 2px solid #009879;
	}

	.heading-image {
		display: block;
		width: 47px;
		height: 47px;
		margin: auto;
		object-fit: contain;
	}

	.control-panel {
		width: 75%;
		max-width: 720px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		margin: 0 auto 10px;
		padding: 0 10px 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(12px);
	}

	.control-panel h2 {
		margin: 8px 0 0;
		color: white;
		text-align: center;
		font-size: 1.1rem;
	}

	.control-field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		width: 100%;
	}

	.control-field label {
		color: #fff;
	}

	.control-field select {
		width: 50%;
		min-height: 40px;
		padding: 6px 10px;
		border: 1px solid rgba(255, 255, 255, 0.35);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(8px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
		color: #fff;
	}

	.control-field option {
		color: #171717;
	}

	.styled-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: min(100%, 240px);
		min-height: 44px;
		padding: 8px 12px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 8px;
		background: rgba(0, 152, 121, 0.35);
		backdrop-filter: blur(8px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
		color: #fff;
		font-weight: 600;
		text-align: center;
		cursor: pointer;
	}

	.styled-button:hover {
		background: rgba(0, 152, 121, 0.6);
	}

	.upload-wrapper {
		position: relative;
		overflow: hidden;
	}

	.upload-wrapper input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.upload-wrapper:focus-within {
		outline: 3px solid #efbf04;
		outline-offset: 3px;
	}

	.feedback {
		margin: 0;
		color: #fff;
		text-align: center;
	}

	.feedback--error {
		color: #ffb4b4;
	}

	@media (max-width: 600px) {
		.control-panel {
			width: 95%;
		}

		.control-field select {
			width: 70%;
		}
	}
</style>
