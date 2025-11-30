import { defineCustomElement } from 'vue'
import WeatherWidget from './components/WeatherWidget.ce.vue'
import './global.css'

const WeatherWidgetElement = defineCustomElement(WeatherWidget)

customElements.define('weather-widget', WeatherWidgetElement)
