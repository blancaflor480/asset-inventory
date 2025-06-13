<template>
  <nav class="bg-white border-b border-gray-200 h-16">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-800">Asset Inventory System</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            {{ userStore.user?.role || 'Loading...' }}
          </span>
          <button 
            @click="logout" 
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span class="material-icons-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout() 
  router.push('/')
}
</script>
