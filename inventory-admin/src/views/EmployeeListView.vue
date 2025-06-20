<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { assetApi } from '@/services/api'
import type { Asset } from '@/types/asset'
import axios from 'axios'

const search = ref('')
const sortBy = ref('assignee')
const sortOrder = ref<'ASC' | 'DESC'>('ASC')
const employees = ref<{ assignee: string, count: number }[]>([])
const selectedAssignee = ref<string | null>(null)
const assets = ref<Asset[]>([])
const showModal = ref(false)
const loading = ref(false)
const error = ref('')

const fetchEmployees = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const res = await axios.get('/api/employees', {
      params: {
        search: search.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      }
    });
    
    employees.value = Array.isArray(res.data) ? res.data.filter(emp => emp.assignee) : [];
  } catch (err) {
    console.error('fetchEmployees error:', err);
    error.value = 'Failed to fetch employees'
    employees.value = [];
  } finally {
    loading.value = false
  }
};

const fetchAssetsByAssignee = async (assignee: string) => {
  try {
    loading.value = true
    error.value = ''
    
    // Use a dedicated endpoint for fetching assets by assignee
    const res = await axios.get(`/api/inventory/assignee/${encodeURIComponent(assignee)}`);
    
    assets.value = Array.isArray(res.data) ? res.data : [];
    
  } catch (err) {
    console.error('fetchAssetsByAssignee error:', err);
    error.value = 'Failed to fetch assets for this employee'
    assets.value = [];
  } finally {
    loading.value = false
  }
};

const handleView = async (assignee: string) => {
  selectedAssignee.value = assignee
  await fetchAssetsByAssignee(assignee)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedAssignee.value = null
  assets.value = []
}

// Computed property to show total value of assets for selected assignee
const totalAssetsValue = computed(() => {
  return assets.value.reduce((total, asset) => {
    return total + (asset.total_value || 0)
  }, 0)
})

onMounted(fetchEmployees)
watch([search, sortBy, sortOrder], fetchEmployees);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">Employee List</h1>
    
    <!-- Search and Sort Controls -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input 
          v-model="search" 
          placeholder="Search assignee..." 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button 
        @click="sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC'"
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
      >
        Sort: {{ sortOrder === 'ASC' ? '↑' : '↓' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading && !showModal" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading employees...</p>
    </div>

    <!-- Employee Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              @click="sortBy = 'assignee'" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Assignee
              <span v-if="sortBy === 'assignee'" class="ml-1">
                {{ sortOrder === 'ASC' ? '↑' : '↓' }}
              </span>
            </th>
            <th 
              @click="sortBy = 'count'"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              # of Assets
              <span v-if="sortBy === 'count'" class="ml-1">
                {{ sortOrder === 'ASC' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="employees.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">
              No employees found
            </td>
          </tr>
          <tr v-for="emp in employees" :key="emp.assignee" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ emp.assignee || 'Unassigned' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ emp.count }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="handleView(emp.assignee)" 
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Assets
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- View Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">
              Assets assigned to: {{ selectedAssignee }}
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Total Assets: {{ assets.length }} | 
              Total Value: ₱{{ totalAssetsValue.toLocaleString() }}
            </p>
          </div>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <!-- Loading State for Assets -->
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Loading assets...</p>
          </div>

          <!-- No Assets Found -->
          <div v-else-if="assets.length === 0" class="text-center py-8">
            <p class="text-gray-500">No assets found for this employee.</p>
          </div>

          <!-- Assets List -->
          <div v-else class="space-y-4">
            <div 
              v-for="asset in assets" 
              :key="asset.id" 
              class="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition-colors"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Row 1: Primary Info -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">MLCA Tag ID</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono">
                    {{ asset.tag_id }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.category || 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    <span :class="{
                      'text-green-600': asset.status === 'Active',
                      'text-red-600': asset.status === 'Inactive',
                      'text-yellow-600': asset.status === 'Maintenance'
                    }">
                      {{ asset.status || 'N/A' }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.condition_status || 'N/A' }}
                  </div>
                </div>

                <!-- Row 2: Description (Full Width) -->
                <div class="md:col-span-2 lg:col-span-4">
                  <label class="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm min-h-[2.5rem]">
                    {{ asset.sn_description || 'No description available' }}
                  </div>
                </div>

                <!-- Row 3: Technical Details -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Model No.</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono">
                    {{ asset.model_no || 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Serial No.</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono">
                    {{ asset.serial_no || 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.dept_area || 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Office</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.office || 'N/A' }}
                  </div>
                </div>

                <!-- Row 4: Financial Info -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Unit Value</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">
                    {{ asset.unit_value ? `₱${asset.unit_value.toLocaleString()}` : 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.qty || '1' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Total Value</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-green-600">
                    {{ asset.total_value ? `₱${asset.total_value.toLocaleString()}` : 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.supplier || 'N/A' }}
                  </div>
                </div>

                <!-- Row 5: Dates -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Date Issued</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.date_issued ? new Date(asset.date_issued).toLocaleDateString() : 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Warranty Expiration</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm">
                    {{ asset.warranty_expiration ? new Date(asset.warranty_expiration).toLocaleDateString() : 'N/A' }}
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                  <div class="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm min-h-[2.5rem]">
                    {{ asset.remarks || 'No remarks' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex justify-between items-center p-6 border-t bg-gray-50">
          <div class="text-sm text-gray-600">
            Showing {{ assets.length }} asset{{ assets.length !== 1 ? 's' : '' }} 
            for {{ selectedAssignee }}
          </div>
          <button 
            @click="closeModal"
            class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-width: 1px;
  border-color: #d1d5db;
  border-radius: 0.375rem;
  outline: none;
}

.input:focus {
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: #3b82f6;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-width: 1px;
  border-color: transparent;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: #fff;
  background-color: #2563eb;
  outline: none;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-primary:focus {
  box-shadow: 0 0 0 2px #3b82f6;
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>