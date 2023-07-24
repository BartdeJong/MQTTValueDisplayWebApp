<template>
	<tr
		@click="handleIBMWatsonClick"
		v-if="jsonResponse != null & !showHistory"
		class="found"
		:class="{'elevenMinuteNotReceiving': isElevenMinuteNoReceive, 'halfAnHourNotReceiving': isHalfAnHourNoReceive}"
	>
		<td>
			<div>{{name}}</div>
		</td>
		<td class="largeText">{{jsonResponse.temperature}} &#8451;</td>
		<td class="largeText">{{jsonResponse.humidity}} %</td>
	</tr>
	<tr
		v-else-if="showHistory"
		@click="handleIBMWatsonClick"
	>
		<td colspan="3">
			<history :sensor-name="deviceId"/>
		</td>
	</tr>
	<tr v-else class="notFound">
		<td>{{name}}</td>
		<td>not</td>
		<td>found</td>
	</tr>
</template>

<script>
import history from "@/components/history.vue";

export default {
	name: "IBMWatson",
	props: ["name", "deviceId"],
	data() {
		return {
			isElevenMinuteNoReceive: false,
			isHalfAnHourNoReceive: false,
            jsonResponse: null,
			showHistory: false,
		};
	},
	methods: {
		getTempAndHum() {
			const requestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({"sensor_name": this.deviceId})
			};
			return fetch('https://bwlgkni215.execute-api.eu-central-1.amazonaws.com/default/read-temp-hum', requestOptions
			).then(response => response.json());
		},
		minuteNoReceive() {
			const localTime = Date.now();
			const utcDateTime2 = new Date(this.jsonResponse.date_time2);
			const timezoneOffsetLocal = new Date().getTimezoneOffset() * 60 * 1000;
			const timeDifference = localTime + timezoneOffsetLocal - utcDateTime2;
			if (timeDifference - 660000 > 0) {
				return true;
			} else {
				return false;
			}
		},
		halfAnHourNoReceive() {
			const localTime = Date.now();
			const utcDateTime2 = new Date(this.jsonResponse.date_time2);
			const timezoneOffsetLocal = new Date().getTimezoneOffset() * 60 * 1000;
			const timeDifference = localTime + timezoneOffsetLocal - utcDateTime2;
			if (timeDifference - 1800000 > 0) {
				return true;
			} else {
				return false;
			}
		},
		handleIBMWatsonClick() {
			this.showHistory = !this.showHistory;
			if (this.showHistory) {
				this.$eventBus.$emit("ibmwatson-clicked" + this.deviceId);
			}
		},
    },
	components: {
		history
	},
    created() {
		this.getTempAndHum().then(response => {
				this.jsonResponse = response;
		});
		setInterval(() => {
			this.getTempAndHum().then(response => {
				this.jsonResponse = response;
				this.isElevenMinuteNoReceive = this.minuteNoReceive();
				this.isHalfAnHourNoReceive = this.halfAnHourNoReceive();
			});
		}, 120000);
	}
};
</script>

<style lang="scss">
.notFound {
	background-color: #171717;
	color: #ee8484;
}

.found {
	background-color: #171717;
	color: #8ce265;
	font-weight: bold;
}

.largeText {
	font-size: xx-large;
}

.elevenMinuteNotReceiving {
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