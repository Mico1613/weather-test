<template>
  <div class="weather-card">
    <div class="main-weather">
      <img
        :src="`http://openweathermap.org/img/wn/${weather?.[0]?.icon || '01d'}@2x.png`"
        alt="Weather Icon"
        class="weather-icon"
      />
      <span class="temperature">{{ Math.round(main?.temp || 0) }}°C</span>
    </div>

    <div class="description">
      Feels like {{ Math.round(main?.feels_like || 0) }}°C.
      {{ weather?.[0]?.description || '' }}.
    </div>

    <div class="details">
      <div class="detail-row">
        <span class="icon">➤</span>
        <span
          >{{ wind?.speed || 0 }}m/s
          {{ getWindDirection(wind?.deg || 0) }}</span
        >
        <span class="separator"></span>
        <span class="icon">⊙</span>
        <span>{{ main?.pressure || 0 }}hPa</span>
      </div>
      <div class="detail-row">
        <span>Humidity: {{ main?.humidity || 0 }}%</span>
        <span class="separator"></span>
        <span
          >Dew point:
          {{ calculateDewPoint(main?.temp || 0, main?.humidity || 0) }}°C</span
        >
      </div>
      <div class="detail-row">
        <span>Visibility: {{ ((visibility || 0) / 1000).toFixed(1) }}km</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherData } from '@/shared/types.ts'
import { directions } from '@/shared/constants.ts'

defineProps<WeatherData>()

function getWindDirection(deg: number): string {
  const index = Math.round(deg / 22.5) % 16
  return directions[index] || 'N'
}

function calculateDewPoint(temp: number, humidity: number): number {
  return Math.round(temp - (100 - humidity) / 5)
}
</script>

<style lang="scss" scoped>
.weather-card {
  padding: 15px;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }

  .card-header {
    font-weight: bold;
    margin-bottom: 10px;
  }

  .main-weather {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .weather-icon {
      width: 50px;
      height: 50px;
    }

    .temperature {
      font-size: 2.5em;
      font-weight: bold;
      margin-left: 10px;
    }
  }

  .description {
    margin-bottom: 15px;
    text-transform: capitalize;
  }

  .details {
    font-size: 0.9em;
    color: #555;

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
}
</style>
