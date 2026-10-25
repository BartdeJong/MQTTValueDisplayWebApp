<script>
	import { onMount } from "svelte";
	import { DEFAULT_LOCATIONS, formatLocationsCookie, parseLocationsCookie } from "../utils/locations.mjs";

	const AVAILABLE_LOCATIONS_URL = "https://c4c6uk1i70.execute-api.eu-central-1.amazonaws.com/prod/read-locations-cdk";
	const DEFAULT_BACKGROUND = `${import.meta.env.BASE_URL}img/background.jpeg`;

	let { onCancel, onSaved } = $props();
	let locations = $state(DEFAULT_LOCATIONS.map(location => ({ ...location })));
	let newLocationName = $state("");
	let possibleLocations = $state([]);
	let selected = $state("");
	let isLoading = $state(false);
	let loadError = $state("");
	let formError = $state("");
	let saveError = $state("");
	let backgroundError = $state("");
	let backgroundImageUrl = $state(DEFAULT_BACKGROUND);
	let abortController;

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
			saveError = `${error.message} Controleer de lijst voordat je deze opslaat.`;
			console.error("Saved locations could not be loaded:", error);
		}

		void getLocations();
		return () => abortController?.abort();
	});

	async function getLocations() {
		abortController?.abort();
		const controller = new AbortController();
		abortController = controller;
		isLoading = true;
		loadError = "";
		try {
			const response = await fetch(AVAILABLE_LOCATIONS_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(`De sensorlijst antwoordde met status ${response.status}.`);
			}
			const text = await response.text();
			if (controller.signal.aborted) return;
			const available = text.split(",").map(value => value.trim()).filter(Boolean);
			const existing = new Set(locations.map(location => location.deviceId));
			possibleLocations = available
				.filter(deviceId => !existing.has(deviceId))
				.map((text, index) => ({ text, id: `available-location-${index}` }));
		} catch (error) {
			if (error.name !== "AbortError" && !controller.signal.aborted) {
				loadError = "Beschikbare sensoren ophalen mislukt. Probeer het later opnieuw.";
				console.error("Available locations request failed:", error);
			}
		} finally {
			if (!controller.signal.aborted) isLoading = false;
		}
	}

	function addLocation(event) {
		event.preventDefault();
		formError = "";
		const deviceId = selected.trim();
		const name = newLocationName.trim() || deviceId;
		if (!deviceId) {
			formError = "Selecteer eerst een sensor.";
			return;
		}
		if (locations.some(location => location.deviceId === deviceId)) {
			formError = "Deze sensor is al toegevoegd.";
			return;
		}
		if (!name || name.length > 80) {
			formError = "De weergavenaam moet tussen 1 en 80 tekens bevatten.";
			return;
		}

		locations = [...locations, { name, deviceId }];
		newLocationName = "";
		selected = "";
		possibleLocations = possibleLocations.filter(location => location.text !== deviceId);
	}

	function removeLocation(index) {
		const location = locations[index];
		if (!window.confirm(`Locatie "${location.name}" verwijderen?`)) return;
		locations = locations.filter((_, locationIndex) => locationIndex !== index);
	}

	function saveAndReturn() {
		try {
			document.cookie = formatLocationsCookie(
				locations,
				window.location.protocol === "https:"
			);
			onSaved();
		} catch (error) {
			saveError = "De locaties konden niet worden opgeslagen.";
			console.error("Locations could not be saved:", error);
		}
	}
</script>

<main class="manage-locations" style={`--dashboard-background: url(${JSON.stringify(backgroundImageUrl)})`}>
	<header class="page-heading">
		<h1>Locaties beheren</h1>
		<p>Kies de sensoren die op het dashboard zichtbaar moeten zijn.</p>
	</header>

	<section class="form-container" aria-labelledby="add-location-heading">
		<h2 id="add-location-heading">Locatie toevoegen</h2>
		{#if isLoading}
			<p role="status">Beschikbare sensoren laden…</p>
		{/if}
		{#if loadError}
			<p class="location-error" role="alert">{loadError}</p>
			<button class="text-button" type="button" onclick={getLocations}>Opnieuw proberen</button>
		{:else if !isLoading && possibleLocations.length === 0}
			<p>Er zijn geen nieuwe sensoren beschikbaar.</p>
		{:else}
			<form onsubmit={addLocation}>
				<fieldset>
					<legend>Beschikbare sensor</legend>
					<div class="radio-options">
						{#each possibleLocations as option (option.text)}
							<div class="radio-option">
								<input
									id={option.id}
									class="radio-input"
									bind:group={selected}
									type="radio"
									name="device-location"
									value={option.text}
									required
								>
								<label class:selected={selected === option.text} for={option.id}>{option.text}</label>
							</div>
						{/each}
					</div>
				</fieldset>
				<label for="new-location-name">Weergavenaam (optioneel)</label>
				<input
					id="new-location-name"
					bind:value={newLocationName}
					type="text"
					maxlength="80"
					autocomplete="off"
					placeholder="Bijvoorbeeld: Serre"
				>
				<button class="styled-button" type="submit" disabled={!selected}>
					Locatie toevoegen
				</button>
			</form>
		{/if}
		{#if formError}
			<p class="location-error" role="alert">{formError}</p>
		{/if}
	</section>

	<section class="table-container" aria-labelledby="saved-locations-heading">
		<h2 id="saved-locations-heading">Ingestelde locaties</h2>
		{#if locations.length === 0}
			<p>Nog geen locaties ingesteld.</p>
		{:else}
			<div class="table-scroll">
				<table class="styled-table">
					<thead>
						<tr>
							<th scope="col">Naam</th>
							<th scope="col">Sensor-ID</th>
							<th scope="col">Actie</th>
						</tr>
					</thead>
					<tbody>
						{#each locations as location, index (location.deviceId)}
							<tr>
								<td class="largeText">{location.name}</td>
								<td>{location.deviceId}</td>
								<td class="centered">
									<button class="remove-button" type="button" onclick={() => removeLocation(index)}>
										Verwijderen
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	{#if saveError}
		<p class="location-error" role="alert">{saveError}</p>
	{/if}
	{#if backgroundError}
		<p class="location-error" role="alert">{backgroundError}</p>
	{/if}
	<div class="location-actions">
		<button class="styled-button" type="button" onclick={saveAndReturn}>
			Opslaan en terug naar dashboard
		</button>
		<button class="styled-button" type="button" onclick={onCancel}>Annuleren</button>
	</div>
</main>

<style>
	.manage-locations {
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

	.manage-locations .page-heading,
	.manage-locations .form-container,
	.manage-locations .table-container {
		width: min(100%, 900px);
		box-sizing: border-box;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
		color: #fff;
	}

	.manage-locations .page-heading {
		text-align: center;
	}

	.manage-locations h1,
	.manage-locations h2 {
		margin-top: 0;
	}

	.manage-locations fieldset {
		margin: 0 0 1rem;
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
	}

	.radio-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.radio-option input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.radio-option label {
		display: inline-block;
		padding: 8px 12px;
		border: 2px solid #009879;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(5px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
		cursor: pointer;
	}

	.radio-option label.selected {
		border-color: #efbf04;
		background: rgba(255, 255, 255, 0.28);
		color: #efbf04;
	}

	.radio-option input:focus-visible + label {
		outline: 3px solid #efbf04;
		outline-offset: 3px;
	}

	.manage-locations input[type="text"] {
		display: block;
		box-sizing: border-box;
		width: 100%;
		min-height: 44px;
		margin: 0.4rem 0 1rem;
		padding: 10px 14px;
		border: 1px solid rgba(255, 255, 255, 0.35);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
		color: #fff;
		text-align: center;
	}

	.manage-locations input[type="text"]::placeholder {
		color: rgba(255, 255, 255, 0.75);
	}

	.manage-locations input[type="text"]:focus {
		border-color: #009879;
		box-shadow: 0 0 0 2px rgba(0, 152, 121, 0.25);
	}

	.styled-button,
	.remove-button,
	.text-button {
		min-height: 44px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 8px;
		cursor: pointer;
	}

	.styled-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: min(100%, 240px);
		padding: 8px 12px;
		background: rgba(0, 152, 121, 0.35);
		backdrop-filter: blur(8px);
		color: #fff;
		font-weight: 600;
		text-align: center;
	}

	.styled-button:hover:not(:disabled) {
		background: rgba(0, 152, 121, 0.6);
	}

	.styled-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.manage-locations .table-scroll {
		overflow-x: auto;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
	}

	.manage-locations .styled-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.manage-locations .styled-table th,
	.manage-locations .styled-table td {
		padding: 6px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		text-align: left;
		overflow-wrap: anywhere;
	}

	.manage-locations .styled-table th {
		background: rgba(0, 152, 121, 0.35);
		color: #fff;
	}

	.manage-locations .styled-table tbody tr:nth-child(even) {
		background: rgba(255, 255, 255, 0.07);
	}

	.remove-button {
		padding: 6px 10px;
		border-color: rgba(255, 255, 255, 0.25);
		background: rgba(152, 0, 55, 0.4);
		color: #fff;
	}

	.remove-button:hover {
		background: rgba(152, 0, 55, 0.7);
	}

	.text-button {
		padding: 0.4rem 0.75rem;
		background: transparent;
		color: #fff;
		text-decoration: underline;
	}

	.location-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}

	.location-error {
		color: #ffb4b4;
	}

	.centered {
		text-align: center !important;
	}

	@media (max-width: 600px) {
		.manage-locations {
			padding: 6px;
		}
	}
</style>
