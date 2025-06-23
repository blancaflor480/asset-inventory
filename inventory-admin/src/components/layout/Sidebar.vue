<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

onMounted(() => {
  userStore.loadUserFromStorage()
})

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard'},
  { name: 'Inventory', path: '/inventory', icon: 'inventory_2' },
  { name: 'Accounts', path: '/accounts', icon: 'people', roles: ['Superadmin'] },
  { name: 'Employees', path: '/employees', icon: 'people' },
  { name: 'Scheduler', path: '/scheduler', icon: 'calendar_today' },
  //{ name: 'Settings', path: '/settings', icon: 'settings', roles: ['Superadmin'] }
]

const filteredMenuItems = computed(() => {
  const role = userStore.user?.role || ''
  return menuItems.filter(item => !item.roles || item.roles.includes(role))
})
</script>

<template>
  <aside class="bg-white h-full border-r border-gray-200">
    <div class="p-4">
      <h2 class="text-lg font-semibold text-gray-800">Menu</h2>
    </div>

    <nav class="space-y-1 px-2">
      <router-link 
        v-for="item in filteredMenuItems" 
        :key="item.path"
        :to="item.path"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
        :class="[
          route.path === item.path
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-700 hover:bg-gray-50'
        ]"
      >
        <span class="material-icons-outlined mr-3 text-xl">{{ item.icon }}</span>
        {{ item.name }}
      </router-link>
    </nav>
  </aside>
</template>
