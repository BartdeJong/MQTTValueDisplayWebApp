<template>
	<div class="home darkest">
		<ion-card class="sizeUp">
			<div class="table-container">
				<table class="styled-table">
					<thead>
					<tr>
						<th>Locatie</th>
						<th><img src="img/temperature.png" alt="Example Image" style="width: 47px; height: 47px;" class="centered-image"></th>
						<th><img src="img/humidity.png" alt="Example Image" style="width: 47px; height: 47px;" class="centered-image"></th>
					</tr>
					</thead>
					<tbody>
						<IBMWatson
							v-for="location in locations"
							:key="location.deviceId"
							@ibmwatson-clicked="handleIBMWatsonClicked"
							:name="location.name"
							:deviceId="location.deviceId"
						/>
					</tbody>
				</table>
			</div>
		</ion-card>
		<label for="date-select">Tijd bereik grafiek:</label>
		<div class="center-container">
			<select name="date" id="date-select" v-model="record_amount" @change="updateRecordAmount" class="styled-select">
				<option value="24">2 uur</option>
				<option value="288">1 dag</option>
				<option value="2016">1 week</option>
				<option value="4016">2 weken</option>
			</select>
		</div>
		<button class="styled-button" @click="goToManageLocations">Beheer locaties</button>
	</div>
</template>
  
<script>
import NoSleep from "nosleep.js";
import { mapGetters } from "vuex";
import IBMWatson from "@/components/IBMWatson";
import problem from "@/components/problem.vue";
import forecast from "@/components/forecast.vue";
import history from "@/components/history.vue";
import router from "@/router";
import ManageLocations from "@/components/ManageLocations.vue";

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
	props: {
      locations: {
        type: Array,
        default() { 
			return [
				{ name: "Woonkamer", deviceId: "Woonkamer" },
				{ name: "Kantoor Bart", deviceId: "Kantoor Bart" },
				{ name: "Kantoor Sjoukje", deviceId: "Kantoor Sjoukje" },
				{ name: "Buiten", deviceId: "Buiten" },
				{ name: "Slaapkamer", deviceId: "Slaapkamer" },
				{ name: "Printer", deviceId: "Printer" },
			]
		},
      },
    },
	data() {
		return {
			isOnline: false,
			sensorNameValue: "Kantoor Bart",
			record_amount: 288
		};
	},
	created() {
		const locationsData = this.getCookie("locationsData");

		if (locationsData !== null) {
			this.locations = JSON.parse(locationsData);
		}
	},
	computed: {
		...mapGetters(["Message", "lastMessageTime"]),
	},
	components: {
		IBMWatson,
		problem,
		forecast,
		history,
		ManageLocations,
	},
	methods: {
		handleIBMWatsonClicked(deviceId) {
			this.$eventBus.$emit("date-change", this.record_amount);
		},
		goToManageLocations() {
			router.push({
				name: "ManageLocations"
			});
		},
		updateLocations(newLocations) {
			this.locations = newLocations;
		},
		getCookie(name) {
			const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
			return cookieValue ? decodeURIComponent(cookieValue.pop()) : null;
		},
		updateRecordAmount() {
			this.$eventBus.$emit("date-change", this.record_amount);
		},
	},
};
</script>
  
<style lang="scss">
.table-container {
  overflow-x: auto;
}

@media (max-width: 600px) {
  .sizeUp {
    font-size: medium;
  }
}

.styled-table {
  border-collapse: collapse;
  margin: 1px 0;
  font-size: 1.05em;
  font-family: sans-serif;
  min-width: 250px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  overflow-x: hidden;
}

/* Styling the header */
.styled-table thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}

/* Styling the table cells */
.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

/* Styling the table rows */
.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #ffffff;
}

.styled-table tbody tr:nth-of-type(odd) {
  background-color: #f3f3f3e3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}

/* Styling the active row */
.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #009879;
}

.centered-image {
  display: block;
  margin: 0 auto;
}

.styled-button {
  background-color: #009879;
  color: #ffffff;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 8px 8px;
  font-size: 1.05em;
  font-family: sans-serif;
  min-width: 95px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  overflow-x: hidden;
  border-radius: 5px;
  text-align: center;
}

.styled-select {
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 5px;
  padding: 8px;
  font-size: 1.05em;
  font-family: sans-serif;
  min-width: 150px;
  width: 50%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  display: block;
}

.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
