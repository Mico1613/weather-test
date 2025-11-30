import type { CityResponse, WeatherData } from '@/shared/types.ts'
import axios from 'axios'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'
// По ТЗ api-key не должен прокидываться из html клиента, так что хардкожу здесь
// (в идеале настроить прокси через собственный бэк, либо прокидывать api-key из html юзера, что проще)
const API_KEY = '8abbcf545d0eeb32a305d2c358ae93ad'

export async function getWeather(
  city?: string,
): Promise<WeatherData | undefined> {
  try {
    if (!city) throw new Error(`No city passed`)
    const response = await axios.get(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`,
    )
    if (response?.statusText !== 'OK') {
      throw new Error(`Weather data not found for ${city}`)
    }
    return { ...response.data, id: String(response.data.id) }
  } catch (error) {
    console.error(error)
  }
}

export async function getWeatherByCoords(
  lat: number,
  lon: number,
): Promise<WeatherData | undefined> {
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
    )
    if (response?.statusText !== 'OK') {
      throw new Error('Weather data not found for coordinates')
    }
    return { ...response.data, id: String(response.data.id) }
  } catch (error) {
    console.error(error)
  }
}

export async function searchCities(
  query: string,
): Promise<CityResponse[] | undefined> {
  try {
    if (!query) return []
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`,
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.map((item: CityResponse) => ({
      id: `${item.lat}-${item.lon}`,
      name: item.name,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }))
  } catch (error) {
    console.error(error)
  }
}
