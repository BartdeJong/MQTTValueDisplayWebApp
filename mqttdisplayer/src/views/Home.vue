<template>
  <div class="home darkest" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <ion-card class="sizeUp">
      <div class="table-container">
        <table class="styled-table">
          <colgroup>
            <col style="width: 45%">
            <col style="width: 28%">
            <col style="width: 27%">
          </colgroup>
          <thead>
            <tr>
              <th>Locatie</th>
              <th><img src="img/temperature.png" alt="Temperature" style="width: 47px; height: 47px;" class="centered-image"></th>
              <th><img src="img/humidity.png" alt="Humidity" style="width: 47px; height: 47px;" class="centered-image"></th>
            </tr>
          </thead>
          <tbody>
            <IBMWatson
              v-for="location in locations"
              :key="location.deviceId"
              :name="location.name"
              :deviceId="location.deviceId"
            />
          </tbody>
        </table>
      </div>
    </ion-card>
    <div class="control-panel">
      <h3 class="panel-title">Instellingen</h3>
      <div class="center-container">
        <select name="date" id="date-select" v-model="record_amount" @change="updateRecordAmount" class="styled-select">
          <option value="24">2 uur</option>
          <option value="288">1 dag</option>
          <option value="2016">1 week</option>
        </select>
      </div>
      <button class="styled-button" @click="goToManageLocations">Beheer locaties</button>
      <label class="styled-button upload-wrapper">
        📁 Kies achtergrond
        <input type="file" accept="image/*" @change="handleBackgroundUpload" class="upload-input" />
      </label>
    </div>
  </div>
</template>
  
<script>
import NoSleep from "nosleep.js";
import { mapGetters } from "vuex";
import IBMWatson from "@/components/IBMWatson";
import problem from "@/components/problem.vue";
import forecast from "@/components/forecast.vue";
import history from "@/components/history.vue";
import router from "@/router";
import ManageLocations from "@/components/ManageLocations.vue";
import { eventBus } from '@/eventBus.js';

var noSleep = new NoSleep();
document.addEventListener("click", function enableNoSleep() {
  document.removeEventListener("click", enableNoSleep, false);
  noSleep.enable();
}, false);

export default {
  name: "home",
  props: {
    locations: {
      type: Array,
      default() {
        return [
          { name: "Woonkamer", deviceId: "Woonkamer" },
          { name: "Kantoor Bart", deviceId: "Kantoor Bart" },
          { name: "Kantoor Sjoukje", deviceId: "Kantoor Sjoukje" },
          { name: "Buiten", deviceId: "Buiten" },
          { name: "Slaapkamer", deviceId: "Slaapkamer" },
          { name: "Printer", deviceId: "Printer" },
        ];
      },
    },
  },
  data() {
    return {
      isOnline: false,
      sensorNameValue: "Kantoor Bart",
      record_amount: 288,
      backgroundImageUrl: localStorage.getItem('userBackgroundImage') || 'https://images.pexels.com/photos/1172064/pexels-photo-1172064.jpeg'
    };
  },
  created() {
	const savedBackground = localStorage.getItem('userBackgroundImage');
	if (savedBackground) {
		this.backgroundImageUrl = savedBackground;
	}

	const locationsData = this.getCookie("locationsData");
	if (locationsData !== null) {
		this.locations = JSON.parse(locationsData);
	}

	console.log('Loaded background:', this.backgroundImageUrl);

	eventBus.$on('create-history', () => {
		this.$eventBus.$emit("date-change", this.record_amount);
	});
  },
  computed: {
    ...mapGetters(["Message", "lastMessageTime"]),
  },
  components: {
    IBMWatson,
    problem,
    forecast,
    history,
    ManageLocations,
  },
  methods: {
    goToManageLocations() {
      router.push({ name: "ManageLocations" });
    },
    updateLocations(newLocations) {
      this.locations = newLocations;
    },
    getCookie(name) {
      const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return cookieValue ? decodeURIComponent(cookieValue.pop()) : null;
    },
    updateRecordAmount() {
      this.$eventBus.$emit("date-change", this.record_amount);
    },
	  handleBackgroundUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280; // or smaller
        canvas.height = (img.height / img.width) * 1280;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // quality 0.7
        this.backgroundImageUrl = compressedDataUrl;
        localStorage.setItem('userBackgroundImage', compressedDataUrl);
        };
      };
      reader.readAsDataURL(file);
    },
  },
};
</script>
  
<style lang="scss">
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', sans-serif;
  color: #1e1e1e;
}

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: center / cover no-repeat fixed;
  transition: background-image 0.3s ease;
}

.control-panel {
  width: 75%;
  max-width: 720px;
  margin: 10px auto;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: 12px 0 4px;
}

.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.styled-select {
  width: 50%;
  padding: 6px 12px;
  font-size: 1.1em;
  font-weight: 500;
  color: #1e1e1e;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
  display: block;
}

.styled-button {
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  padding: 6px 18px;
  font-size: 1.1em;
  font-weight: 600;
  color: #ffffff;
  background: rgba(0, 152, 121, 0.35);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.styled-button:hover {
  background: rgba(0, 152, 121, 0.5);
}

.upload-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  margin-bottom: 10px;
}

.upload-input {
  display: none;
}

.upload-button {
  padding: 8px 14px;
  font-size: 1em;
  font-weight: 500;
  color: #1e1e1e;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  transition: background 0.3s ease;
}

.upload-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.table-container {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 1em;
  font-weight: 500;
  color: #2a2a2a;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(2px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.styled-table thead tr {
  background: rgba(0, 152, 121, 0.35);
  color: #ffffff;
  font-weight: 600;
  text-align: left;
}

.styled-table th,
.styled-table td {
  padding: 7px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  word-wrap: break-word;
}

.styled-table tbody tr:nth-of-type(even) {
  background: rgba(255, 255, 255, 0.08);
}

.styled-table tbody tr:nth-of-type(odd) {
  background: rgba(255, 255, 255, 0.1);
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid rgba(0, 152, 121, 0.4);
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #00c9a7;
}

.centered-image {
  display: block;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .sizeUp {
    font-size: medium;
  }
}
</style>