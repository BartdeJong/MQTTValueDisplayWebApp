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
  </ion-card>
</template>

<script>
import { get } from "http";
export default {
  name: "forecast",
  data() {
    return {
      latitude: null,
      longitude: null,
	    forecast: null,
	    reloadTime: null
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
    },
    getForecast() {
	  this.reloadTime = this.getForecastLoadTime()
      return fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" + this.latitude + "&lon=" + this.longitude + "&appid=cd9898a0c4c40f3078c9e4edb04eb7cc"
      ).then(response => response.json());
    },
    reloadForecast() {
      document.getElementById("reloadIcon").style.webkitAnimationPlayState =
        "running";
      this.getForecast().then(response => {
        this.forecast = response;
        setTimeout(() => {
          document.getElementById("reloadIcon").style.webkitAnimationPlayState = "paused";
		}, 1000);
      });
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
    }
  },
  created() {
    navigator.geolocation.getCurrentPosition(this.success);
    setInterval(() => {
      this.getForecast().then(response => {
        this.forecast = response;
      });
    }, 3600000);
    setTimeout(() => {
      document.getElementById("reloadIcon").style.webkitAnimationPlayState =
        "paused";
    }, 1000);
  }
};
</script>

<style lang="scss" scoped>
.forecast {
  background-color: #2a2a2a;
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
  background-color: #313131;
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