<template>
  <div class="weather-widget">
    <div v-if="view === 'weather'" class="weather-view">
      <div v-if="storageCities.length === 0" class="no-cities">
        <span>No cities configured.</span>
        <button @click="view = 'settings'">Add City</button>
      </div>
      <div
        v-else
        v-for="city in storageCities"
        :key="city.id"
        class="city-container"
      >
        <div class="header">
          <h3>{{ city.name }}, {{ city.country }}</h3>
          <button class="settings-btn" @click="view = 'settings'">⚙️</button>
        </div>
        <WeatherCard
          v-if="city.id && weatherData[city.id]"
          v-bind="weatherData[city.id]"
        />
      </div>
    </div>

    <div v-else class="settings-view">
      <div class="header">
        <span class="title">Settings</span>
        <button class="close-btn" @click="view = 'weather'">✕</button>
      </div>
      <SettingsPanel
        :cities="storageCities"
        @add="handleAddCity"
        @remove="handleRemoveCity"
        @reorder="handleReorderCities"
        :isLoading="isWeatherLoading"
        :cityExists="cityExists"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WeatherCard from './WeatherCard.ce.vue'
import SettingsPanel from './SettingsPanel.ce.vue'
import type { CityConfig, WeatherData } from '@/shared/types.ts'
import { useStorage } from '@vueuse/core'
import { CITIES_STORAGE_KEY, WEATHER_STORAGE_KEY } from '@/shared/constants.ts'
import { getWeather, getWeatherByCoords } from '@/api/api.ts'
import { getCurrentLocation } from '@/shared/utils.ts'

const view = ref<'weather' | 'settings'>('weather')
const isWeatherLoading = ref(false)
const cityExists = ref(false)
const storageCities = useStorage<CityConfig[]>(
  CITIES_STORAGE_KEY,
  [],
  localStorage,
  {
    listenToStorageChanges: true,
  },
)
const weatherData = useStorage<Record<string, WeatherData | undefined>>(
  WEATHER_STORAGE_KEY,
  {},
  localStorage,
  {
    listenToStorageChanges: true,
  },
)

onMounted(async () => {
  if (storageCities.value.length > 0) {
    updateAllCitiesWeather()
  } else {
    try {
      const coords = await getCurrentLocation()
      const data = await getWeatherByCoords(coords.lat, coords.lon)
      const newCity: CityConfig = {
        id: data?.id,
        name: data?.name,
        country: data?.sys?.country,
        lat: coords.lat,
        lon: coords.lon,
      }
      storageCities.value.push(newCity)
      if (newCity.id) weatherData.value[newCity.id] = data
    } catch (e) {
      console.error('Failed to get location or weather', e)
    }
  }
})

async function updateAllCitiesWeather() {
  for (const city of storageCities.value) {
    try {
      const data = await getWeather(city?.name)
      if (!city.country) {
        city.country = data?.sys?.country
      }
      if (city.id) weatherData.value[city.id] = data
    } catch (e) {
      console.error(`Failed to update weather for ${city.name}`, e)
    }
  }
}

async function handleAddCity(city: CityConfig) {
  cityExists.value = false
  isWeatherLoading.value = true
  let data: WeatherData | undefined
  if (city.lat && city.lon) {
    data = await getWeatherByCoords(city.lat, city.lon)
  } else {
    data = await getWeather(city.name)
  }

  const newCity: CityConfig = {
    id: data?.id,
    name: data?.name,
    country: data?.sys?.country,
    lat: data?.coord?.lat,
    lon: data?.coord?.lon,
  }

  if (storageCities.value.find((item) => item.id === newCity.id)) {
    cityExists.value = true
    isWeatherLoading.value = false
    setTimeout(() => {
      cityExists.value = false
    }, 3000)
    return
  }
  storageCities.value.push(newCity)
  if (newCity.id) weatherData.value[newCity.id] = data
  isWeatherLoading.value = false
}

function handleRemoveCity(id: string) {
  storageCities.value = storageCities.value.filter((c) => c.id !== id)
  delete weatherData.value[id]
}

function handleReorderCities(newCities: CityConfig[]) {
  storageCities.value = newCities
}
</script>

<style lang="scss" scoped>
.weather-widget {
  width: 250px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #333;
  position: relative;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;

    > h3 {
      margin: 0;
    }

    .settings-btn,
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2em;
    }

    .title {
      font-weight: bold;
    }
  }

  .city-container {
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
  }

  .loading,
  .no-cities {
    padding: 20px;
    text-align: center;
    color: #888;
    display: grid;
    grid-auto-flow: row;
    gap: 20px;
  }
}
</style>
