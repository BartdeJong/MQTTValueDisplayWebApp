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
			return fetch('https://eu-de.functions.cloud.ibm.com/api/v1/web/c01c2703-8b9c-4b17-a419-11091502a1e5/hello-world/TestPython.json?device=' + this.deviceId
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