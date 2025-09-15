<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['filter', 'sort', 'search'])

const filters = ref({
  category: '',
  dept_area: '',
  status: '',
  condition_status: '',
  sortBy: '',
  sortOrder: 'ASC'
})

const categories = [
  'Mobile Phone',
  'Laptop',
  'Desktop',
  'Others'
]

const departments = [
  'Logistics',
  'Executive Office',
  'Sales',
  'Purchasing',
  'Marketing',
  'MD',
  'Sales Engineer',
  'Human Resources'
]

const statuses = [
  'Active',
  'Inactive',
  'Available',
  'In Maintenance',
  'Disposed',
  'Lost'
]

const conditions = [
  'New',
  'Good',
  'Fair',
  'Poor',
  'Damaged'
]

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'tag_id', label: 'Tag ID' },
  { value: 'sn_description', label: 'Description' },
  { value: 'total_value', label: 'Total Value' }
]

const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('ASC')

const handleFilterChange = () => {
  emit('filter', filters.value)
}

const handleSortChange = () => {
  emit('sort', {
    sortBy: filters.value.sortBy,
    sortOrder: filters.value.sortOrder
  })
}

const toggleSortOrder = () => {
  filters.value.sortOrder = filters.value.sortOrder === 'ASC' ? 'DESC' : 'ASC'
  handleSortChange()
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(handleSearch, 300)
})
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow mb-6">
    <!-- Search field -->
    
    <!-- Filter and Sort controls -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <!-- Category Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select 
          v-model="filters.category"
          @change="handleFilterChange"
          class="w-full"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <!-- Department Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select 
          v-model="filters.dept_area"
          @change="handleFilterChange"
          class="w-full"
        >
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept" :value="dept">
            {{ dept }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select 
          v-model="filters.status"
          @change="handleFilterChange"
          class="w-full"
        >
          <option value="">All Statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <!-- Condition Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
        <select 
          v-model="filters.condition_status"
          @change="handleFilterChange"
          class="w-full"
        >
          <option value="">All Conditions</option>
          <option v-for="condition in conditions" :key="condition" :value="condition">
            {{ condition }}
          </option>
        </select>
      </div>

      <!-- Sort By -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select 
          v-model="filters.sortBy"
          @change="handleSortChange"
          class="w-full"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Sort Order -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
        <button 
          @click="toggleSortOrder"
          class="w-full flex items-center justify-center px-4 py-2 border rounded-md text-sm"
          :class="filters.sortOrder === 'ASC' ? 'bg-gray-50' : 'bg-gray-100'"
        >
          <span class="material-icons-outlined mr-1">
            {{ filters.sortOrder === 'ASC' ? 'arrow_upward' : 'arrow_downward' }}
          </span>
          {{ filters.sortOrder === 'ASC' ? 'Ascending' : 'Descending' }}
        </button>
      </div>
    </div>
  </div>
</template>