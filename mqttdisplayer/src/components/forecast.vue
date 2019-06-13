<template>
  <ion-card class="forecast" v-if="forecast != null">
    <ion-subtitle class="location">
      {{forecast.location.name}}
    </ion-subtitle>
    <table class="centered">
      <thead class="gray">
        <tr>
          <th>Day</th>
          <th>Temperature</th>
          <th>Icon</th>
        </tr>
      </thead>
      <tbody class="tableBody">
        <tr>
          <td style="color:white;">Today</td>
          <td class="text">{{forecast.forecast.forecastday[0].day.maxtemp_c}} &#8451;</td>
          <td>
            <img class="resize" :src="forecast.forecast.forecastday[0].day.condition.icon">
          </td>
        </tr>
        <tr>
          <td style="color:white;">Tomorrow</td>
          <td class="text">{{forecast.forecast.forecastday[1].day.maxtemp_c}} &#8451;</td>
          <td>
            <img class="resize" :src="forecast.forecast.forecastday[1].day.condition.icon">
          </td>
        </tr>
      </tbody>
    </table>
  </ion-card>
</template>

<script>
export default {
  name: "forecast",
  data() {
    return {
      latitude: null,
      longitude: null,
      forecast: null
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
      return fetch(
        "https://api.apixu.com/v1/forecast.json?key=880e39005a8041e8a18180832192505&q=" +
          this.latitude +
          "," +
          this.longitude +
          "&days=2"
      ).then(response => response.json());
    }
  },
  created() {
    navigator.geolocation.getCurrentPosition(this.success);
    setInterval(() => {
      this.getForecast().then(response => {
        this.forecast = response;
      });
    }, 600000);
  }
};
</script>

<style lang="scss" scoped>
.forecast {
  background-color: #2a2a2a;
  font-size: large;

  thead{
	  line-height: 1.2;
  }

  th{
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
  max-width:80%;
  max-height:80%;
}

.location{
  font-size: x-large;
  color: rgb(182, 182, 182);
}
</style>