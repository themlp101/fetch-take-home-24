import { defineStore } from 'pinia'
import { ref, shallowRef, type ShallowRef } from 'vue'
import axios from 'axios'
import type { Dog, DogSearchQueryParams } from '@/types'

export const useDogStore = defineStore('dogStore', () => {
  const baseUrl = 'https://frontend-take-home-service.fetch.com'

  const breeds = ref([])
  const httpStatus = ref('')
  const total = ref(0)
  const next = ref('')
  const prev = ref('')
  const dogs: ShallowRef<Dog[]> = shallowRef([])
  // App.vue is calling this onMount so we will know authentication status when the app mounts
  async function getBreeds() {
    try {
      const { data, status } = await axios.get(`${baseUrl}/dogs/breeds`, {
        withCredentials: true
      })
      breeds.value = data
      httpStatus.value = status.toString()
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else console.error(error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function searchDogs(params: DogSearchQueryParams, _url: string = baseUrl || '') {
    try {
      const searchResults = await axios.get(`${baseUrl}/dogs/search`, {
        withCredentials: true,
        params
      })

      total.value = searchResults.data.total
      next.value = searchResults.data.next
      prev.value = searchResults.data.prev

      const dogObjects = await axios.post(`${baseUrl}/dogs`, searchResults.data.resultIds, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      dogs.value = dogObjects.data
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else console.error(error)
    }
  }

  async function goNextPage(params: DogSearchQueryParams) {
    try {
      await searchDogs(params, baseUrl + next.value)
    } catch (error) {
      console.error(error)
    }
  }
  async function goPrevPage(params: DogSearchQueryParams) {
    try {
      await searchDogs(params, baseUrl + prev.value)
    } catch (error) {
      console.error(error)
    }
  }

  function isAuthenticated() {
    return httpStatus.value === '200'
  }

  function reset() {
    breeds.value = []
    httpStatus.value = ''
    dogs.value = []
  }

  return {
    breeds,
    getBreeds,
    httpStatus,
    reset,
    isAuthenticated,
    searchDogs,
    dogs,
    total,
    next,
    prev,
    goNextPage,
    goPrevPage
  }
})