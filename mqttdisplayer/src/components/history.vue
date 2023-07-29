<template>
  <ion-card class="history">
    <h2 class="sensor-heading">{{ formattedSensorName }}</h2>
    <canvas :id="'line-chart-' + sensorName" width="200" height="100"></canvas>
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
        body: JSON.stringify({"sensor_name": sensorName, "record_amount": 288})
      };
      fetch('https://ksmmf8pbj2.execute-api.eu-central-1.amazonaws.com/read-last-temps', requestOptions)
      .then(response => response.text())
      .then(response => {
        if (response.trim() !== '') {
          this.historyData = response;
          this.refreshHistoryGraph();
        }
      })
      .catch(error => {
        console.log("Error fetching history data" + error);
      });
    },
    getHistoryData() {
      if (this.historyData != null) {
        let rain = this.historyData.split(/\r\n/);
        rain.pop();
        for (let value in rain) {
          rain[value] = parseFloat(rain[value]);
        }
        return rain;
      }
    },
    refreshHistoryGraph() {
      const canvasId = "line-chart-" + this.sensorName;
      const canvasElement = document.getElementById(canvasId);

      new Chart(canvasElement, {
        type: 'line',
        data: {
          labels: ["now","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","now"],
          datasets: [{ 
              data: this.getHistoryData(),
              borderColor: "#009879",
              fill: true
            }
          ]
        },
        options: {
          elements: {
              point:{
                  radius: 0
              }
          },
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
    eventBus.$on('ibmwatson-clicked' + this.deviceId, () => {
      this.fetchHistoryData(this.sensorName);
    });

    setInterval(() => {
      this.fetchHistoryData(this.sensorName);
    }, 300000);
  },
  mounted() {
    this.fetchHistoryData(this.sensorName);
  }
};
</script>

<style>
.sensor-heading {
  font-size: 1.5rem;
  padding: 5px;
  margin: 0;
  color: rgb(85, 85, 85);
  text-align: center;
}
</style>
