<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDogStore } from '../stores/dog'

const dogStore = useDogStore()

const selected = ref([])
const ageMin = ref(0)
const ageMax = ref(10)
const size = ref(25)
const from = ref(0)
const sortBy = ref(':asc')
const sortMethod = ref('breed')

const params = computed(() => ({
  breeds: selected.value,
  ageMax: ageMax.value,
  ageMin: ageMin.value,
  size: size.value,
  from: from.value,
  sort: sortMethod.value + sortBy.value
}))
const sortMethods = [
  { id: 'name', title: 'Name' },
  { id: 'breed', title: 'Breed' },
  { id: 'age', title: 'Age' }
]
async function handleSearch() {
  // clean up store before every search and start from the first index
  dogStore.dogs = []
  from.value = 0
  await dogStore.searchDogs(params.value)
}
async function goNext() {
  from.value += size.value
  await dogStore.goNextPage(params.value)
}
async function goPrev() {
  from.value -= size.value
  await dogStore.goPrevPage(params.value)
}

const hasFavorites = ref(false)
dogStore.$subscribe((_, store) => {
  const favorites = Object.keys(store.favoritesList)
  if (favorites.length > 0) {
    hasFavorites.value = true
  } else hasFavorites.value = false
})
</script>
<template>
  <!--Controls-->
  <div class="grid grid-cols-1 auto-rows-min sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
    <div class="grid grid-cols-1">
      <label for="ageMin" class="block text-sm font-medium leading-6 text-gray-900">Min. Age</label>
      <input
        type="number"
        name="ageMin"
        id="ageMin"
        class="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
        v-model="ageMin"
      />

      <label for="ageMax" class="block text-sm font-medium leading-6 text-gray-900">Max. Age</label>
      <input
        type="number"
        name="ageMax"
        id="ageMax"
        class="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-600 sm:text-sm sm:leading-6"
        v-model="ageMax"
      />
    </div>

    <div class="sm:col-span-2">
      <label for="Breeds" class="block text-sm font-medium leading-6 text-gray-900">Breeds</label>
      <select
        id="Breeds"
        name="Breeds"
        class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
        multiple
        size="6"
        v-model="selected"
      >
        <option v-for="(breed, index) in dogStore.breeds" :key="index + breed">
          {{ breed }}
        </option>
      </select>
    </div>
    <div class="col-span-1">
      <label for="Sort By" class="block text-sm font-medium leading-6 text-gray-900">Sort By</label>
      <select
        id="sortBy"
        name="sortBy"
        class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6"
        v-model="sortBy"
      >
        <option value=":asc">Ascending</option>
        <option value=":desc">Descending</option>
      </select>
    </div>

    <div class="col-start-1 space-y-6 sm:flex sm:items-center sm:space-x-2 sm:space-y-0">
      <div v-for="method in sortMethods" :key="method.id" class="flex items-center">
        <input
          :id="method.id"
          name="notification-method"
          type="radio"
          :checked="method.id == 'breed'"
          class="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
          :value="method.id"
          v-model="sortMethod"
        />
        <label :for="method.id" class="ml-3 block text-sm font-medium leading-6 text-gray-900">{{
          method.title
        }}</label>
      </div>
    </div>

    <div class="col-span-1 col-start-1">
      <button
        type="button"
        class="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 mt-2"
        @click.prevent="handleSearch"
      >
        Search
      </button>
    </div>
    <div class="col-span-1 sm:col-start-3">
      <button
        type="button"
        class="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:opacity-50"
        :disabled="!hasFavorites"
        @click.prevent="dogStore.findMatch"
      >
        Find Match
      </button>
    </div>
  </div>
  <!--Pagination Bar-->
  <nav
    v-if="dogStore.total > 0"
    class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-xs text-gray-700">
        Showing
        {{ ' ' }}
        <span class="font-medium">{{ from + 1 > dogStore.total ? dogStore.total : from + 1 }}</span>
        {{ ' ' }}
        to
        {{ ' ' }}
        <span class="font-medium">{{
          size + from > dogStore.total ? dogStore.total : size + from
        }}</span>
        {{ ' ' }}
        of
        {{ ' ' }}
        <span class="font-medium">{{ dogStore.total }}</span>
        {{ ' ' }}
        results
      </p>
    </div>
    <div class="flex flex-1 justify-end">
      <a
        v-if="dogStore.prev"
        href="#"
        class="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        @click.prevent="goPrev"
        >Previous
      </a>
      <a
        v-if="dogStore.next && size + from < dogStore.total"
        href="#"
        class="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        @click.prevent="goNext"
        >Next
      </a>
    </div>
  </nav>
</template>
