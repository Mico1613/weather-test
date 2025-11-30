export interface WeatherData {
  id?: string
  name?: string
  sys?: { country: string }
  main?: { temp: number; feels_like: number; humidity: number; pressure: number }
  weather?: { main: string; description: string; icon: string }[]
  wind?: { speed: number; deg: number }
  visibility?: number
  coord?: { lat: number; lon: number }
}

export interface CityConfig {
  id?: string
  name?: string
  country?: string
  lat?: number
  lon?: number
}

export type CityResponse = Omit<CityConfig, 'id'>
