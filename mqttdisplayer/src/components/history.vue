<template>
  <ion-card class="history" @click="toggleData">
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
    },
  },
  data() {
    return {
      historicData: null,
      currentDataType: 'Temperatuur',
      record_amount: 288
    };
  },
  methods: {
    fetchhistoricData(record_amount) {
      const type = this.currentDataType == 'Temperatuur' ? "temps" : "hums"
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"sensor_name": this.sensorName, "record_amount": record_amount})
      };
      fetch('https://ksmmf8pbj2.execute-api.eu-central-1.amazonaws.com/read-last-' + type, requestOptions)
      .then(response => response.text())
      .then(response => {
        if (response.trim() !== '') {
          this.historicData = response;
          this.refreshHistoryGraph(record_amount);
        }
      })
      .catch(error => {
        console.log("Error fetching history data" + error);
      });
    },
    gethistoricData() {
      if (this.historicData != null) {
        let data = this.historicData.split(/\r\n/);
        data.pop();
        for (let value in data) {
          data[value] = parseFloat(data[value]);
        }
        return data;
      }
    },
    refreshHistoryGraph(record_amount) {
      const canvasId = "line-chart-" + this.sensorName;
      const canvasElement = document.getElementById(canvasId);
      const labels = new Array(record_amount).fill("-");

      new Chart(canvasElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            { 
              data: this.gethistoricData(),
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
      this.fetchhistoricData(parseInt(this.record_amount));
    },
  },
  created() {
    eventBus.$on('date-change', (value) => {
      this.record_amount = value;
      this.fetchhistoricData(parseInt(value));
    });
  },
  mounted() {
    this.$eventBus.$emit("create-history");
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