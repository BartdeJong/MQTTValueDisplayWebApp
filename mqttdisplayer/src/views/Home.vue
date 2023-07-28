<template>
	<div class="home darkest">
	  <!-- <history :sensor-name="sensorNameValue" /> -->
	  <ion-card class="sizeUp">
		<div class="table-container">
		  <table class="styled-table">
			<thead>
			  <tr>
				<th>Name</th>
				<th>Temperature</th>
				<th>Humidity</th>
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
	</div>
  </template>
  
  <script>
  import NoSleep from "nosleep.js";
  import { mapGetters } from "vuex";
  import IBMWatson from "@/components/IBMWatson";
  import problem from "@/components/problem.vue";
  import forecast from "@/components/forecast.vue";
  import history from "@/components/history.vue";
  
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
		isOnline: false,
		sensorNameValue: "Kantoor Bart",
		locations: [
		  { name: "Woonkamer", deviceId: "Woonkamer" },
		  { name: "Kantoor Bart", deviceId: "Kantoor Bart" },
		  { name: "Kantoor Sjoukje", deviceId: "Kantoor Sjoukje" },
		  { name: "Buiten", deviceId: "Buiten" },
		  { name: "Slaapkamer", deviceId: "Slaapkamer" },
		  { name: "Printer", deviceId: "Printer" },
		],
	  };
	},
	computed: {
	  ...mapGetters(["Message", "lastMessageTime"]),
	},
	components: {
	  IBMWatson,
	  problem,
	  forecast,
	  history,
	},
	methods: {
	  // Update the sensorNameValue when an IBMWatson component is clicked
	  handleIBMWatsonClicked(deviceId) {
		this.sensorNameValue = deviceId;
	  },
	},
  };
  </script>
  
  <style lang="scss">
/* Additional styles for mobile responsiveness */
.table-container {
  overflow-x: auto;
}

@media (max-width: 600px) {
  .sizeUp {
    font-size: medium;
  }
}

/* Styling the table */
.styled-table {
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.9em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  width: 100%;
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
</style>
