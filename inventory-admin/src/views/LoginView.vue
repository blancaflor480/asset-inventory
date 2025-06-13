<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

const userStore = useUserStore()

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      userStore.setUser(data.user)
      userStore.setToken(data.token)
      router.push('/dashboard')
    } else {
      error.value = data.message || 'Invalid credentials'
      console.error('Login failed:', data)
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Login failed. Please check your connection and try again.'
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
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Sign in
          </button>
        </div>
        

      </form>
    </div>
  </div>
</template>