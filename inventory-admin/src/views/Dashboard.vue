<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import { useAccountStore } from '@/stores/account';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'vue-chartjs';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const inventoryStore = useInventoryStore();
const accountStore = useAccountStore();
const showAccountModal = ref(false);
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// Stats with percentages
const stats = computed(() => [
  {
    name: 'Total Assets',
    value: inventoryStore.totalItems,
    icon: 'inventory_2',
    iconColor: 'text-blue-500',
    percentage: calculatePercentage(inventoryStore.totalItems, 'assets'),
    trend: 'up'
  },
  {
    name: 'Active Users',
    value: accountStore.items.filter(a => a.status === 'Active').length,
    icon: 'people',
    iconColor: 'text-green-500',
    percentage: calculatePercentage(accountStore.items.length, 'users'),
    trend: 'up'
  },
  {
    name: 'Available Assets',
    value: inventoryStore.items.filter(i => i.status === 'Available').length,
    icon: 'check_circle',
    iconColor: 'text-emerald-500',
    percentage: calculatePercentage(inventoryStore.items.filter(i => i.status === 'Available').length, 'available'),
    trend: 'neutral'
  },
  {
    name: 'Assigned Assets',
    value: inventoryStore.items.filter(i => i.status === 'Assigned').length,
    icon: 'assignment_turned_in',
    iconColor: 'text-purple-500',
    percentage: calculatePercentage(inventoryStore.items.filter(i => i.status === 'Assigned').length, 'assigned'),
    trend: 'up'
  }
]);

// Calculate percentages based on previous data
function calculatePercentage(current: number, type: string): number {
  // You should implement logic to compare with historical data
  // This is a placeholder that generates random percentage changes
  return Math.floor(Math.random() * 20) + 1;
}

const handleUpdateAccount = async (data: any) => {
  try {
    const response = await fetch(`http://localhost:3000/api/accounts/${currentUser.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      currentUser.value = updatedUser;
      showAccountModal.value = false;
      alert('Account updated successfully!');
    }
  } catch (error) {
    console.error('Error updating account:', error);
    alert('Failed to update account');
  }
};

onMounted(async () => {
  if (userStore.user?.role !== 'Superadmin') {
    router.push('/inventory');
    return;
  }

  await Promise.all([
    inventoryStore.fetchItems(),
    accountStore.fetchAccounts()
  ]);
});

// Add new computed properties for charts
const statusChartData = computed(() => {
  const statusCounts = inventoryStore.items.reduce((acc: Record<string, number>, item) => {
    acc[item.status as string] = (acc[item.status as string] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#4F46E5', '#10B981', '#EF4444', '#F59E0B']
    }]
  };
});

const conditionChartData = computed(() => {
  const conditionCounts = inventoryStore.items.reduce((acc: Record<string, number>, item) => {
    const key = item.condition_status ?? 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(conditionCounts),
    datasets: [{
      data: Object.values(conditionCounts).map(v => Number(v)),
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
    }]
  };
});

const departmentChartData = computed(() => {
  const deptCounts = inventoryStore.items.reduce((acc: Record<string, number>, item) => {
    acc[item.dept_area] = (acc[item.dept_area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(deptCounts),
    datasets: [{
      label: 'Assets by Department',
      data: Object.values(deptCounts),
      backgroundColor: '#4F46E5'
    }]
  };
});

// Calculate total value
const totalValue = computed(() => {
  return inventoryStore.items.reduce((sum, item) => {
    return sum + (Number(item.total_value) || 0);
  }, 0);
});

// Get recent inventory items
const recentItems = computed(() => {
  return [...inventoryStore.items]
    .sort((a, b) => 
      new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime()
    )
    .slice(0, 5);
});

// Chart options
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p class="mt-1 text-sm text-gray-600">Welcome back, {{ currentUser.username }}</p>
        </div>
        <button 
          @click="showAccountModal = true"
          class="flex items-center text-sm text-gray-700 hover:text-indigo-600"
        >
          <span class="material-icons-outlined mr-1">account_circle</span>
          Account Settings
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.name" 
             class="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
            </div>
            <div class="flex flex-col items-end">
              <span class="material-icons-outlined text-2xl" :class="stat.iconColor">
                {{ stat.icon }}
              </span>
              <div class="mt-2 flex items-center text-sm">
                <span class="material-icons-outlined text-sm" 
                      :class="stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'">
                  {{ stat.trend === 'up' ? 'trending_up' : stat.trend === 'down' ? 'trending_down' : 'trending_flat' }}
                </span>
                <span :class="stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'">
                  {{ stat.percentage }}%
                </span>
              </div>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full" 
                   :style="{ width: `${stat.percentage}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Status Distribution -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Asset Status Distribution</h3>
          <div class="h-64">
            <Pie :data="statusChartData" :options="pieOptions" />
          </div>
        </div>

        <!-- Condition Distribution -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Asset Condition Distribution</h3>
          <div class="h-64">
            <Pie :data="conditionChartData" :options="pieOptions" />
          </div>
        </div>

        <!-- Department Distribution -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Assets by Department</h3>
          <div class="h-64">
            <Bar :data="departmentChartData" :options="barOptions" />
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Total Value Card -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Total Asset Value</h3>
            <span class="material-icons-outlined text-indigo-600">payments</span>
          </div>
          <p class="mt-2 text-3xl font-bold text-indigo-600">
            ₱{{ totalValue.toLocaleString() }}
          </p>
          <div class="mt-4 h-2 bg-gray-200 rounded-full">
            <div class="h-2 bg-indigo-600 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <!-- Recent Items -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Recent Additions</h3>
            <span class="material-icons-outlined text-indigo-600">update</span>
          </div>
          <div class="space-y-4">
            <div v-for="item in recentItems" :key="item.id" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-medium text-gray-900">{{ item.tag_id }}</p>
                <p class="text-sm text-gray-500">{{ item.sn_description }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-indigo-600">₱{{ Number(item.total_value).toLocaleString() }}</p>
                <p class="text-xs text-gray-500">
                  {{ item.created_at ? new Date(String(item.created_at)).toLocaleDateString() : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Settings Modal -->
      <div v-if="showAccountModal" class="fixed inset-0 overflow-hidden z-50">
        <div class="absolute inset-0 bg-gray-500 bg-opacity-75" 
             @click="showAccountModal = false"></div>
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div class="bg-white rounded-lg max-w-lg w-full p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Account Settings</h2>
              <button @click="showAccountModal = false" 
                      class="text-gray-400 hover:text-gray-500">
                <span class="material-icons-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="handleUpdateAccount">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    v-model="currentUser.username"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="currentUser.email"
                    type="email"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    New Password (optional)
                  </label>
                  <input
                    v-model="currentUser.password"
                    type="password"
                    class="mt-1 block w-full rounded-md border-gray-300"
                  />
                  <p class="mt-1 text-sm text-gray-500">
                    Leave blank to keep current password
                  </p>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="btn-secondary"
                  @click="showAccountModal = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  display: inline-flex;
  justify-content: center;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background-color: #4f46e5;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #4338ca;
}
.btn-primary:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.btn-secondary {
  display: inline-flex;
  justify-content: center;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #f9fafb;
}
.btn-secondary:focus {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
</style>