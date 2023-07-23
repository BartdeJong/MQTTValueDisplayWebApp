<template>
  <ion-card class="history">
    <h2 class="sensor-heading">{{ formattedSensorName }} Sensor</h2>
    <canvas id="line-chart" width="800" height="150"></canvas>
  </ion-card>
</template>

<script>
import Chart from "chart.js";
import { eventBus } from '@/eventBus.js';

export default {
  name: "history",
  props: {
    sensorName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      historyData: null
    };
  },
  computed: {
    formattedSensorName() {
      return this.sensorName.charAt(0).toUpperCase() + this.sensorName.slice(1);
    }
  },
  methods: {
    fetchHistoryData(sensorName) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"sensor_name": sensorName, "record_amount": 24})
      };
      fetch('https://ksmmf8pbj2.execute-api.eu-central-1.amazonaws.com/read-last-temps', requestOptions)
      .then(response => response.text())
      .then(response => {
        this.historyData = response;
        this.refreshHistoryGraph();
      })
      .catch(error => {
        alert("Error fetching history data");
      });
    },
    getHistoryData() {
      if (this.historyData != null) {
        let rain = this.historyData.split(/\r\n/);
        rain.pop();
        for (let value in rain) {
          var calculated = parseFloat(rain[value].substr(0, 2));
          rain[value] = calculated > 0.01 ? calculated : 0;
        }
        return rain;
      }
    },
    refreshHistoryGraph() {
      new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: {
          labels: ["now","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+2 hours"],
          datasets: [{ 
              data: this.getHistoryData(),
              borderColor: "lightblue",
              fill: true
            }
          ]
        },
        options: {
          legend: false,
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
            xAxes: [{
              display: false
            }]
          }
        }
      });
    }
  },
  created() {
    eventBus.$on('ibmwatson-clicked', (sensorName) => {
      this.sensorName = sensorName;
      this.fetchHistoryData(sensorName);
    });

    setInterval(() => {
      this.fetchHistoryData(this.sensorName);
    }, 10000);

    setTimeout(() => {
      document.getElementById("reloadIcon").style.animationPlayState =
        "paused";
    }, 1000);
  },
  mounted() {
    this.fetchHistoryData(this.sensorName);
    setTimeout(() => {
      this.refreshHistoryGraph();
    }, 500);
  }
};
</script>

<style>
@keyframes rotate {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

.sensor-heading {
  font-size: 1.5rem; /* Adjust the font size as needed */
  padding: 5px; /* Adjust the padding as needed */
  margin: 0; /* Remove any margin to reduce space */
}
</style>
