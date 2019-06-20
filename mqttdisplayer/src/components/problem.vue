<template>
	<div>
		<ion-item class="toggleBox">
			<ion-label style="padding-left: 5%;">Display only</ion-label>
			<div :class="{ 'inActive': !displayOnly }">OFF</div>
			<ion-toggle class="toggle" @ionChange="displayOnly = !displayOnly" v-bind:checked="displayOnly"></ion-toggle>
			<div :class="{ 'active': displayOnly }">ON</div>
		</ion-item>
		<ion-card v-if="problem" class="problem">
			<ion-card-title class="problemTitle">The following problems have occured</ion-card-title>
			<ion-card-subtitle v-if="!isOnline" class="problemText">&#9632; Offline</ion-card-subtitle>
			<ion-card-subtitle v-if="!batteryCharging" class="problemText">&#9632; Not charging</ion-card-subtitle>
		</ion-card>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "problem",
	data() {
		return {
			hasProblem: false,
			isOnline: false,
			batteryCharging: false,
			displayOnly: false
		};
	},
	computed: {
		...mapGetters(["Message", "lastMessageTime"]),
		problem() {
			return (
				this.displayOnly && (!this.isOnline || !this.batteryCharging)
			);
		}
	},
	created() {
		setInterval(() => {
			this.online().then(response => {
				this.isOnline = response;
			});
			this.batteryStatus().then(response => {
				this.batteryCharging = response.charging;
			});
		}, 5000);
	},
	methods: {
		online() {
			return new Promise((resolve, reject) => {
				fetch("https://jsonplaceholder.typicode.com/todos/1")
					.then(response => {
						if (response.status == 200) resolve(true);
						else resolve(false);
					})
					.catch(() => {
						resolve(false);
					});
			});
		},
		batteryStatus() {
			return new Promise(resolve => {
				navigator.getBattery().then(response => {
					resolve(response);
				});
			});
		}
	}
};
</script>

<style lang="css">
.toggleBox {
	--background: #000000;
	color: #ffffff;
	padding: 0;
}

.problem {
	background-color: #b43131;
}

.problemText {
	color: #ffffff;
	font-size: x-large;
}

.problemTitle {
	color: #ffffff;
}

.toggle {
	--background: rgb(122, 122, 122);
	--handle-background: #3d3d3d;
	--handle-background-checked: #3d3d3d;
	--background-checked: rgb(122, 122, 122);
}

.active {
	color: green;
}

.inActive {
	color: rgb(172, 0, 0);
}
</style>