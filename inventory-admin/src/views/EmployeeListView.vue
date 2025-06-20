<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { assetApi } from '@/services/api'
import type { Asset } from '@/types/asset'

const search = ref('')
const sortBy = ref('assignee')
const sortOrder = ref<'ASC' | 'DESC'>('ASC')
const employees = ref<{ assignee: string, count: number }[]>([])
const selectedAssignee = ref<string | null>(null)
const assets = ref<Asset[]>([])
const showModal = ref(false)

const fetchEmployees = async () => {
  const res = await assetApi.get('/employees', { params: { search: search.value, sortBy: sortBy.value, sortOrder: sortOrder.value } })
  employees.value = res.data
}

const fetchAssetsByAssignee = async (assignee: string) => {
  const res = await assetApi.get('/assets', { params: { assignee } })
  assets.value = res.data.items
}

const handleView = async (assignee: string) => {
  selectedAssignee.value = assignee
  await fetchAssetsByAssignee(assignee)
  showModal.value = true
}

onMounted(fetchEmployees)
watch([search, sortBy, sortOrder], fetchEmployees)
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">List Employee</h1>
    <div class="flex gap-2 mb-4">
      <input v-model="search" placeholder="Search assignee..." class="input" />
      <button @click="sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC'">
        Sort: {{ sortOrder }}
      </button>
    </div>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th @click="sortBy = 'assignee'">Assignee</th>
          <th @click="sortBy = 'count'"># of Assets</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in employees" :key="emp.assignee">
          <td>{{ emp.assignee }}</td>
          <td>{{ emp.count }}</td>
          <td>
            <button @click="handleView(emp.assignee)" class="btn-primary">View</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- View Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 class="text-lg font-bold mb-4">Assets for {{ selectedAssignee }}</h2>
        <button class="absolute top-2 right-2" @click="showModal = false">Close</button>
        <div v-for="asset in assets" :key="asset.id" class="mb-4 border-b pb-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="font-semibold">Category</label>
              <input :value="asset.category" class="input" readonly />
            </div>
            <div>
              <label class="font-semibold">Tag ID</label>
              <input :value="asset.tag_id" class="input" readonly />
            </div>
            <div>
              <label class="font-semibold">Description</label>
              <input :value="asset.sn_description" class="input" readonly />
            </div>
            <div>
              <label class="font-semibold">Status</label>
              <input :value="asset.status" class="input" readonly />
            </div>
            <!-- Add more fields as needed -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>