<script>
	import { onMount } from "svelte";

	let time = $state("");

	function setTime() {
		time = new Intl.DateTimeFormat("nl-NL", {
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date());
	}

	onMount(() => {
		setTime();
		const timer = setInterval(setTime, 10_000);
		return () => clearInterval(timer);
	});
</script>

<section class="clock" aria-label="Huidige tijd">
	<h2 class="clockText">{time}</h2>
</section>

<style>
	.clock {
		padding: 1rem;
		border-radius: 8px;
		background: #171717;
	}

	.clockText {
		margin: 0;
		color: #fff;
		font-size: clamp(2rem, 12vw, 5rem);
	}
</style>
