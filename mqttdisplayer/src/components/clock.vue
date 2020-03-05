<template>
	<ion-card class="clock">
		<ion-card-title class="clockText">{{time}}</ion-card-title>
	</ion-card>
</template>

<script>
export default {
	name: "clock",
	data() {
		return {
			time: null
		};
	},
	methods: {
		setTime() {
			var today = new Date();
			let hourFiller = "";
			let minuteFiller = "";
			if (today.getHours() < 10) hourFiller = "0";
			if (today.getMinutes() < 10) minuteFiller = "0";
			this.time =
				hourFiller +
				today.getHours() +
				":" +
				minuteFiller +
				today.getMinutes();
		}
	},
	created() {
		this.setTime();
		setInterval(() => {
			this.setTime();
		}, 10000);
	}
};
</script>

<style lang="scss">
.clock {
	background-color: #171717;
}

.clockText {
	color: white;
	font-size: 500%;
}
</style>