<template>
	<tr
		v-if="jsonResponse != null"
		class="found"
	>
		<td>
			<div>{{name}}</div>
		</td>
		<td class="largeText">{{jsonResponse.temperature}} &#8451;</td>
		<td class="largeText">{{jsonResponse.humidity}} %</td>
	</tr>
	<tr v-else class="notFound">
		<td>{{name}}</td>
		<td>not</td>
		<td>found</td>
	</tr>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "IBMWatson",
	props: ["name", "deviceId"],
	data() {
		return {
            jsonResponse: null
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
		}
    },
    created() {
		this.getTempAndHum().then(response => {
				this.jsonResponse = response;
		});
		setInterval(() => {
			this.getTempAndHum().then(response => {
				this.jsonResponse = response;
			});
		}, 5000);
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