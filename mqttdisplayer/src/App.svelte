<script>
	import { onMount } from "svelte";
	import Dashboard from "./components/Dashboard.svelte";
	import ManageLocations from "./components/ManageLocations.svelte";

	function routeFromHash() {
		return window.location.hash === "#/manage-locations" ? "manage-locations" : "home";
	}

	let route = $state(typeof window === "undefined" ? "home" : routeFromHash());

	function navigate(nextRoute) {
		window.location.hash = nextRoute === "manage-locations" ? "/manage-locations" : "/";
	}

	onMount(() => {
		const updateRoute = () => {
			route = routeFromHash();
			document.title = route === "manage-locations"
				? "Locaties beheren · MQTT Waarden"
				: "MQTT Waarden";
		};

		window.addEventListener("hashchange", updateRoute);
		updateRoute();

		return () => window.removeEventListener("hashchange", updateRoute);
	});
</script>

{#if route === "manage-locations"}
	<ManageLocations onCancel={() => navigate("home")} onSaved={() => navigate("home")} />
{:else}
	<Dashboard onManageLocations={() => navigate("manage-locations")} />
{/if}
