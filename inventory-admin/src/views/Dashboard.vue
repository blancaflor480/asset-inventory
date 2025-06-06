<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref([
  { 
    name: 'Total Assets', 
    value: 150, 
    icon: 'inventory_2',
    iconColor: 'text-blue-500' 
  },
  { 
    name: 'Active Assets', 
    value: 120, 
    icon: 'check_circle',
    iconColor: 'text-green-500' 
  },
  { 
    name: 'In Use', 
    value: 100, 
    icon: 'person',
    iconColor: 'text-indigo-500' 
  },
  { 
    name: 'Maintenance', 
    value: 5, 
    icon: 'build',
    iconColor: 'text-orange-500' 
  }
])

const recentActivities = ref([
  {
    id: 1,
    icon: 'add_circle',
    title: 'New laptop added to inventory',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    icon: 'swap_horiz',
    title: 'Asset transferred to Marketing department',
    timestamp: '4 hours ago'
  },
  // Add more activities as needed
])
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      <p class="mt-1 text-sm text-gray-600">Monitor your asset statistics and recent activities.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.name" 
           class="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="material-icons-outlined text-2xl" 
                  :class="stat.iconColor">
              {{ stat.icon }}
            </span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="bg-white rounded-lg shadow border border-gray-100">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-medium text-gray-900">Recent Activities</h2>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="activity in recentActivities" :key="activity.id" 
             class="p-6 flex items-center gap-4">
          <span class="material-icons-outlined text-gray-400">
            {{ activity.icon }}
          </span>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.timestamp }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>