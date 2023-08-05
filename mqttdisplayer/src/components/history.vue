<template>
  <ion-card class="history" @click="toggleData">
    <h2 class="sensor-heading">{{ formattedSensorName }}</h2>
    <canvas :id="'line-chart-' + sensorName" width="200" height="100"></canvas>
    <div class="data-type-overlay">{{ currentDataType }}</div>
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
      historicTempData: null,
      historicHumData: null,
      currentDataType: 'Temperatuur'
    };
  },
  computed: {
    formattedSensorName() {
      return this.sensorName.charAt(0).toUpperCase() + this.sensorName.slice(1);
    }
  },
  methods: {
    fetchHistoricTempData(sensorName) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"sensor_name": sensorName, "record_amount": 288})
      };
      fetch('https://ksmmf8pbj2.execute-api.eu-central-1.amazonaws.com/read-last-temps', requestOptions)
      .then(response => response.text())
      .then(response => {
        if (response.trim() !== '') {
          this.historicTempData = response;
          this.refreshHistoryGraph();
        }
      })
      .catch(error => {
        console.log("Error fetching history data" + error);
      });
    },
    gethistoricTempData() {
      if (this.historicTempData != null) {
        let data = this.historicTempData.split(/\r\n/);
        data.pop();
        for (let value in data) {
          data[value] = parseFloat(data[value]);
        }
        return data;
      }
    },
    fetchHistoricHumData(sensorName) {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"sensor_name": sensorName, "record_amount": 288})
      };
      fetch('https://ksmmf8pbj2.execute-api.eu-central-1.amazonaws.com/read-last-hums', requestOptions)
      .then(response => response.text())
      .then(response => {
        if (response.trim() !== '') {
          this.historicHumData = response;
          this.refreshHistoryGraph();
        }
      })
      .catch(error => {
        console.log("Error fetching history data" + error);
      });
    },
    gethistoricHumData() {
      if (this.historicHumData != null) {
        let data = this.historicHumData.split(/\r\n/);
        data.pop();
        for (let value in data) {
          data[value] = parseFloat(data[value]);
        }
        return data;
      }
    },
    refreshHistoryGraph() {
      const canvasId = "line-chart-" + this.sensorName;
      const canvasElement = document.getElementById(canvasId);

      new Chart(canvasElement, {
        type: 'line',
        data: {
          labels: ["now","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","now"],
          datasets: [
            { 
              data: this.currentDataType == 'Temperatuur' ? this.gethistoricTempData() : this.gethistoricHumData(),
              borderColor: this.currentDataType == 'Temperatuur' ? "#009879" : "#FF5C5C",
              fill: true,
              backgroundColor: this.currentDataType == 'Temperatuur' ? "#0098791C" : "#FF5C5C1C"
            },
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
    },
    toggleData() {
      this.currentDataType = this.currentDataType === 'Temperatuur' ? 'Luchtvochtigheid' : 'Temperatuur';
      this.refreshHistoryGraph();
    },
  },
  created() {
    eventBus.$on('ibmwatson-clicked' + this.deviceId, () => {
      this.fetchHistoricTempData(this.sensorName);
      this.fetchHistoricHumData(this.sensorName);
    });

    setInterval(() => {
      this.fetchHistoricTempData(this.sensorName);
      this.fetchHistoricHumData(this.sensorName);
    }, 300000);
  },
  mounted() {
    this.fetchHistoricTempData(this.sensorName);
    this.fetchHistoricHumData(this.sensorName);
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

.data-type-overlay {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2rem;
  background-color: rgba(255, 255, 255, 0.459);
  padding: 5px 10px;
  border-radius: 5px;
  color: #333;
  z-index: 2;
}
</style>