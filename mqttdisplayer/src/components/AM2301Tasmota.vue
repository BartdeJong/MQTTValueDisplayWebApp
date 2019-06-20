<template>
	<tr
		v-if="Message(topic) != null"
		class="found"
		:class="{'minuteNotReceiving': isMinuteNoReceive, 'halfAnHourNotReceiving': isHalfAnHourNoReceive}"
	>
		<td>
			<div>{{mqttName}}</div>
			<div v-if="isMinuteNoReceive">{{messageAge}}</div>
		</td>
		<td class="largeText">{{temperatureFromMessage(Message(topic))}} &#8451;</td>
		<td class="largeText">{{humidityFromMessage(Message(topic))}} %</td>
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
	props: ["topic", "mqttName", "broker"],
	data() {
		return {
			isMinuteNoReceive: false,
			isHalfAnHourNoReceive: false,
			messageAge: 0,
			mqtt: null,
			options: {
				rejectUnauthorized: false,
				clientId: this.getRandomClientId()
				// username: "local-user",
				// password: "TestBroker1234"
			}
		};
	},
	created() {
		this.mqtt = new MQTT(this.broker, this.options, this.topic);
		setInterval(() => {
			if (this.Message(this.topic) != null) {
				this.isMinuteNoReceive = this.minuteNoReceive();
				this.isHalfAnHourNoReceive = this.halfAnHourNoReceive();
				this.messageAge = this.messageAgeCalculator();
			}
		}, 500);
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
		minuteNoReceive() {
			if (
				Date.now() -
					Date.parse(this.Message(this.topic).Time) -
					300000 >
				0
			)
				return true;
			else return false;
		},
		halfAnHourNoReceive() {
			if (
				Date.now() -
					Date.parse(this.Message(this.topic).Time) -
					1800000 >
				0
			)
				return true;
			else return false;
		},
		messageAgeCalculator() {
			let seconds = Math.floor(
				(Date.now() - Date.parse(this.Message(this.topic).Time)) / 1000
			);
			var days = Math.floor(seconds / (3600 * 24));
			seconds -= days * 3600 * 24;
			var hrs = Math.floor(seconds / 3600);
			seconds -= hrs * 3600;
			var mnts = Math.floor(seconds / 60);
			seconds -= mnts * 60;

			let dayFiller = "";
			let hourFiller = "";
			let minuteFiller = "";
			let secondFiller = "";

			if (days < 10) dayFiller = "0";
			if (hrs < 10) hourFiller = "0";
			if (mnts < 10) minuteFiller = "0";
			if (seconds < 10) secondFiller = "0";
			return (
				dayFiller +
				days +
				":" +
				hourFiller +
				hrs +
				":" +
				minuteFiller +
				mnts +
				":" +
				secondFiller +
				seconds
			);
		},
		temperatureFromMessage(message) {
			return JSON.parse(message.payload).AM2301.Temperature;
		},
		humidityFromMessage(message) {
			return JSON.parse(message.payload).AM2301.Humidity;
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