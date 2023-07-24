<template>
	<div class="home darkest">
	  <!-- <history :sensor-name="sensorNameValue" /> -->
	  <ion-card class="sizeUp">
		<div class="table-container">
		  <table class="centered">
			<thead class="gray">
			  <tr>
				<th>Location</th>
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
  .sizeUp {
	font-size: large;
	line-height: 0.5;
	overflow-x: auto;
  }
  
  table {
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
  }
  
  th,
  td {
	padding: 12px;
	text-align: left;
	word-wrap: break-word;
  }
  
  th {
	background-color: #171717;
	color: #a8a8a8;
  }
  
  tr:hover {
	background-color: #3d3d3d;
  }
  
  .gray {
	background-color: #171717;
	color: #a8a8a8;
  }
  
  /* Additional styles for mobile responsiveness */
  .table-container {
	overflow-x: auto;
  }
  
  @media (max-width: 600px) {
	.sizeUp {
	  font-size: medium;
	}
  }
  </style>
  