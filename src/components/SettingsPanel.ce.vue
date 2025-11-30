<template>
  <div class="settings-panel">
    <div class="city-list">
      <div
        v-for="(city, index) in cities"
        :key="city.id"
        class="city-item"
        draggable="true"
        @dragstart="dragStart(index, $event)"
        @dragover.prevent
        @dragenter.prevent
        @drop="drop(index)"
      >
        <div class="drag-handle">☰</div>
        <span class="city-name">{{ city.name }}, {{ city.country }}</span>
        <button class="remove-btn" @click="$emit('remove', city?.id ?? '')">
          🗑️
        </button>
      </div>
    </div>

    <div class="add-location">
      <label>Add Location:</label>
      <div class="input-group">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Search city..."
          type="text"
        />
      </div>
      <div
        v-if="
          !isLoading && Array.isArray(searchResults) && searchResults.length > 0
        "
        class="search-results"
      >
        <div
          v-for="result in searchResults"
          :key="result.id"
          class="search-item"
          @click="selectCity(result)"
        >
          {{ result.name }}, {{ result.country }}
        </div>
      </div>
      <div v-else-if="searchQuery && !isSearching" class="no-results">
        No cities found
      </div>
      <div v-else-if="cityExists">City is already in list</div>
      <div v-else-if="isSearching || isLoading" class="loading">
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CityConfig } from '@/shared/types.ts'
import { searchCities } from '@/api/api.ts'

const props = defineProps<{
  cities: CityConfig[]
  isLoading: boolean
  cityExists: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'add', city: CityConfig): void
  (e: 'reorder', cities: CityConfig[]): void
}>()

const searchQuery = ref('')
const searchResults = ref<CityConfig[] | undefined>([])
const isSearching = ref(false)
const draggedIndex = ref<number | null>(null)
let searchTimeout: ReturnType<typeof setTimeout> | undefined

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await searchCities(searchQuery.value)
    } catch (e) {
      console.error(e)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 200)
}

function selectCity(city: CityConfig) {
  emit('add', city)
  searchQuery.value = ''
  searchResults.value = []
}

function dragStart(index: number, event: DragEvent) {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function drop(index: number) {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const newCities = [...props.cities]
    const [movedItem] = newCities.splice(draggedIndex.value, 1)
    if (movedItem) {
      newCities.splice(index, 0, movedItem)
      emit('reorder', newCities)
    }
  }
  draggedIndex.value = null
}
</script>

<style lang="scss" scoped>
.settings-panel {
  padding: 15px;

  .city-list {
    margin-bottom: 20px;
    display: grid;
    grid-auto-flow: row;
    gap: 5px;
  }

  .city-item {
    display: flex;
    align-items: center;
    background: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
    cursor: grab;

    .drag-handle {
      margin-right: 10px;
      color: #888;
    }

    .city-name {
      flex-grow: 1;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2em;
    }
  }

  .add-location {
    position: relative;

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .input-group {
      display: flex;

      input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-height: 150px;
      overflow-y: auto;
      z-index: 10;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

      .search-item {
        padding: 8px;
        cursor: pointer;
        &:hover {
          background: #f0f0f0;
        }
      }
    }

    .no-results {
      margin-top: 5px;
      color: #888;
      font-style: italic;
    }
  }
}
</style>
