<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { API_BASE_URL } from '@/config/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const userStore = useUserStore()

const handleLogin = async () => {
  
  try {
    if (!email.value || !password.value) {
      error.value = 'Please enter both email and password'
      return
    }

    // Show loading state
    isLoading.value = true
    error.value = ''

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    
    // Check if response is ok
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check server connection.')
      }
      const errorData = await response.json()
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()
    userStore.setUser(data.user)
    userStore.setToken(data.token)
    router.push('/dashboard')

  } catch (err) {
    console.error('Login error:', err)
    error.value = err instanceof Error ? err.message : 'Login failed. Please check your connection.'
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-600">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div v-if="error" class="text-red-500 text-center text-sm bg-red-50 p-2 rounded">
        {{ error }}
      </div>
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Asset Inventory System
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Please sign in to your account
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>
              Sign in
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>