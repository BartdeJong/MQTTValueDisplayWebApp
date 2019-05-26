<template>
  <ion-card class="forecast" v-if="forecast != null">
    <table class="centered">
          <thead class="gray">
            <tr>
              <th>Day</th>
              <th>Temperature</th>
              <th>Icon</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Today</td>
              <td class="text">{{forecast.forecast.forecastday[0].day.maxtemp_c}} &#8451;</td>
              <td>
                <img :src="forecast.forecast.forecastday[0].day.condition.icon">
                </td>
            </tr>
            <tr>
              <td>Tomorrow</td>
              <td class="text">{{forecast.forecast.forecastday[1].day.maxtemp_c}} &#8451;</td>
              <td>
                <img :src="forecast.forecast.forecastday[1].day.condition.icon">
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
      console.log(crd.latitude + "     " + crd.longitude);
      this.getForecast().then(response => {
        this.forecast = response;
        console.log(response);
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

<style lang="scss">
.forecast {
  background-color: #2a2a2a;
}

.text {
  color: white;
  font-size: 250%;
}

.gray {
  background-color: #313131;
  color: #a8a8a8;
}
</style>