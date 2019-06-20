<template>
	<tr
		v-if="Message(topic + '/temperature') != null && Message(topic + '/humidity') != null"
		class="found"
	>
		<td>
			<div>{{mqttName}}</div>
		</td>
		<td class="largeText">{{temperatureFromMessage(Message(topic + "/temperature"))}} &#8451;</td>
		<td class="largeText">{{humidityFromMessage(Message(topic + "/humidity"))}} %</td>
	</tr>
	<tr v-else class="notFound">
		<td>{{mqttName}}</td>
		<td>not</td>
		<td>found</td>
	</tr>
</template>

<script>
import MQTT from "@/components/mqtt";
import { mapGetters } from "vuex";

export default {
	name: "AM2301",
	props: ["topic", "mqttName", "broker", "login"],
	data() {
		return {
			messageAge: 0,
			mqtt: null,
			options: {
				rejectUnauthorized: false,
				clientId: this.getRandomClientId()
			}
		};
	},
	created() {
		this.mqtt = new MQTT(this.broker, this.options, this.topic + "/#");
	},
	computed: {
		...mapGetters(["Message"])
	},
	methods: {
		getRandomClientId() {
			let string = "";
			for (let i = 0; i < 25; i++) {
				let char = String.fromCharCode(
					97 + Math.floor(Math.random() * 26)
				);
				string += char;
			}
			return string;
		},
		temperatureFromMessage(message) {
			return message.payload.substring(0, 4);
		},
		humidityFromMessage(message) {
			return message.payload;
		}
	}
};
</script>

<style lang="scss">
.notFound {
	background-color: #313131;
	color: #ee8484;
}

.found {
	background-color: #313131;
	color: #8ce265;
	font-weight: bold;
}

.largeText {
	font-size: xx-large;
}

.minuteNotReceiving {
	color: rgb(255, 238, 0);
}

.halfAnHourNotReceiving {
	color: orangered;
}

tr {
	td {
		padding: 0px 5px !important;
		line-height: 1.5;
	}
}
</style>