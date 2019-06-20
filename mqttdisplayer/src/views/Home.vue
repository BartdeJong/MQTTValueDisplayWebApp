<template>
	<div class="move">
		<div class="home darkest">
			<problem/>
			<clock/>
			<forecast/>
			<ion-card class="sizeUp">
				<table class="centered">
					<thead class="gray">
						<tr>
							<th>Location</th>
							<th>Temperature</th>
							<th>Humidity</th>
						</tr>
					</thead>
					<tbody>
						<AM2301Tasmota
							:topic="'tele/wemosd1/SENSOR'"
							:mqttName="'Slaapkamer'"
							:broker="'wss://broker.0f.nl:8084/'"
						></AM2301Tasmota>
						<AM2301Tasmota
							:topic="'tele/buiten/SENSOR'"
							:mqttName="'Buiten'"
							:broker="'wss://broker.0f.nl:8084/'"
						></AM2301Tasmota>
						<AM2301Tasmota
							:topic="'tele/tuinkamer/SENSOR'"
							:mqttName="'Tuinkamer'"
							:broker="'wss://broker.0f.nl:8084/'"
						></AM2301Tasmota>
						<AM2301RFHub
							:topic="'rfhub/sensor/0/2'"
							:mqttName="'RFHub'"
							:broker="'wss://broker.0f.nl:8084/'"
						></AM2301RFHub>
					</tbody>
				</table>
			</ion-card>
		</div>
	</div>
</template>

<script>
import NoSleep from "nosleep.js";
import MQTT from "@/components/mqtt";
import { mapGetters } from "vuex";
import AM2301Tasmota from "@/components/AM2301Tasmota.vue";
import AM2301RFHub from "@/components/AM2301RFHub";
import problem from "@/components/problem.vue";
import clock from "@/components/clock.vue";
import forecast from "@/components/forecast.vue";
import { Promise } from "q";
import { setInterval } from "timers";

var noSleep = new NoSleep();
document.addEventListener(
	"click",
	function enableNoSleep() {
		document.removeEventListener("click", enableNoSleep, false);
		noSleep.enable();
	},
	false
);

export default {
	name: "home",
	data() {
		return {
			isOnline: false
		};
	},
	computed: {
		...mapGetters(["Message", "lastMessageTime"])
	},
	components: {
		AM2301Tasmota,
		AM2301RFHub,
		problem,
		clock,
		forecast
	}
};
</script>

<style lang="scss">
.sizeUp {
	font-size: large;
	line-height: 0.5;

	thead {
		line-height: 1.2;
	}

	th {
		padding-top: 8px;
		padding-bottom: 8px;
	}
}

.gray {
	background-color: #313131;
	color: #a8a8a8;
}

@keyframes example {
	0% {
		transform: translate(0px, 0%);
	}
	50% {
		transform: translate(0px, 5%);
	}
	100% {
		transform: translate(0px, 0%);
	}
}

.move {
	animation: example 3600s infinite;
	// animation-duration: 10s infinite;
}
</style>