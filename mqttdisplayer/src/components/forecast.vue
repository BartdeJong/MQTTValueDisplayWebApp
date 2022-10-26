<template>
  <ion-card class="forecast" v-if="forecast != null">
    <table class="centered">
      <thead class="gray">
        <tr>
          <th class="reload" @click="reloadForecast">
            <ion-icon class="reload reload-animation" id="reloadIcon" name="refresh" size="large"></ion-icon>
          </th>
          <th class="reload">
            <ion-subtitle class="location">{{forecast.city.name.substr(forecast.city.name.length - 10)}}</ion-subtitle>
          </th>
          <th class="reload">{{reloadTime}}</th>
        </tr>
        <tr>
          <th>Day</th>
          <th>Temperature</th>
          <th>Icon</th>
        </tr>
      </thead>
      <tbody class="tableBody">
        <tr>
          <td style="color:white;">Today</td>
          <td class="text">{{(getHighToday(0) - 273).toFixed(2)}} &#8451;</td>
          <td>
            <img
              class="resize"
              :src="'../img/' + forecast.list[0].weather[0].icon + '@2x.png'"
            />
          </td>
        </tr>
        <tr>
          <td style="color:white;">Tomorrow</td>
          <td class="text">{{(getHighToday(8) - 273).toFixed(2)}} &#8451;</td>
          <td>
            <img
              class="resize"
              :src="'../img/' + forecast.list[24].weather[0].icon + '@2x.png'"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <canvas id="line-chart" width="800" height="150"></canvas>
  </ion-card>
</template>

<script>
import { get } from "http";
import Chart from "chart.js";
export default {
  name: "forecast",
  data() {
    return {
      latitude: null,
      longitude: null,
	    forecast: null,
      reloadTime: null,
      rainData: null
    };
  },
  methods: {
    success(pos) {
      var crd = pos.coords;
      this.latitude = crd.latitude;
      this.longitude = crd.longitude;
      this.getForecast().then(response => {
        this.forecast = response;
      });
      fetch("https://gpsgadget.buienradar.nl/data/raintext/?lat=" + this.latitude + "&lon=" + this.longitude)
      .then(response => response.text())
      .then(response => this.rainData = response)
    },
    onError(msg){
      alert("Error location")
    },
    getForecast() {
	  this.reloadTime = this.getForecastLoadTime()
      return fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" + this.latitude + "&lon=" + this.longitude + "&appid=cd9898a0c4c40f3078c9e4edb04eb7cc"
      ).then(response => response.json());
    },
    reloadForecast() {
      document.getElementById("reloadIcon").style.animationPlayState =
        "running";
      this.getForecast().then(response => {
        this.forecast = response;
        setTimeout(() => {
          document.getElementById("reloadIcon").style.animationPlayState = "paused";
		}, 1000);
      });
      fetch("https://gpsgadget.buienradar.nl/data/raintext/?lat=" + this.latitude + "&lon=" + this.longitude)
      .then(response => response.text())
      .then(response => this.rainData = response)
      this.refreshRainGraph();
    },
    getForecastLoadTime() {
      let date = new Date();
      let hours = date.getHours();
      let minutes = this.shouldAddZero(date.getMinutes());
      return hours + ":" + minutes;
    },
    shouldAddZero(minutes) {
      return minutes < 10 ? "0" + minutes : minutes;
    },
    getHighToday(forward) {
      var today = []
      this.forecast.list.filter(hour => hour.dt_txt.substr(8, 2) == this.forecast.list[forward].dt_txt.substr(8, 2)).forEach(hour => 
        today.push(hour.main.temp)
      )
      return Math.max(...today)
    },
    getRainData() {
      if(this.rainData != null){
        let rain = this.rainData.split(/\r\n/)
        rain.pop()
        let rainArray = []
        for(let value in rain){
          var calculated = Math.pow(10,(( parseFloat(rain[value].substr(0,3))-109)/32))
          if(calculated > 0.01){
            rain[value] = calculated
          } else {
            rain[value] = 0
          }
        }
        return rain
      }
    },
    refreshRainGraph() {
      new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: {
          labels: ["now","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+2 hours"],
          datasets: [{ 
              data: this.getRainData(),
              borderColor: "#3e95cd",
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
      })
    }
  },
  created() {
    navigator.geolocation.getCurrentPosition(this.success, this.onError);
    setInterval(() => {
      this.getForecast().then(response => {
        this.forecast = response;
      });
    }, 3600000);
    setTimeout(() => {
      document.getElementById("reloadIcon").style.animationPlayState =
        "paused";
    }, 1000);
  },
  mounted() {
    setTimeout(() => {
      this.refreshRainGraph();
    }, 500)
  }
};
</script>

<style lang="scss" scoped>
.forecast {
  background-color: #171717;
  font-size: large;

  thead {
    line-height: 1.2;
  }

  th {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

.text {
  color: white;
  font-size: xx-large;
}

.gray {
  background-color: #232323;
  color: #a8a8a8;
}

.tableBody {
  line-height: 0;

  td {
    padding: 0px 5px !important;
  }
}

img.resize {
  padding-left: 17%;
  max-width: 80%;
  max-height: 80%;
}

.location {
  font-size: x-large;
  color: rgb(182, 182, 182);
}

.reload {
  padding: 2px;
  line-height: 0;
  padding-top: 2px !important;
  padding-bottom: 2px !important;

  &.reload-animation {
    animation: rotate 1s infinite linear;
  }
}

@keyframes rotate {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>