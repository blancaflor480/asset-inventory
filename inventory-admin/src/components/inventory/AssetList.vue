<script setup lang="ts">
import { ref } from 'vue'
import Alert from '@/components/common/Alert.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { assetApi } from '@/services/api' // Changed import path

type AlertType = 'success' | 'error' // Add type definition

const assets = ref<any[]>([])
const alert = ref({
  show: false,
  type: 'success' as AlertType, // Add type assertion
  message: ''
})

const deleteModal = ref({
  show: false,
  assetId: null as number | null
})

const showAlert = (type: AlertType, message: string) => { // Update type
  alert.value = {
    show: true,
    type,
    message
  }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const fetchAssets = async () => {
  try {
    const response = await assetApi.getAll({
      page: 1,
      limit: 10,
      search: ''
    })
    assets.value = response.items
  } catch (error) {
    showAlert('error', 'Failed to fetch assets')
  }
}

// Fetch assets when component is mounted
import { onMounted } from 'vue'
onMounted(fetchAssets)

const confirmDelete = (assetId: number) => {
  deleteModal.value = {
    show: true,
    assetId
  }
}

const handleDelete = async () => {
  if (!deleteModal.value.assetId) return
  
  try {
    await assetApi.delete(deleteModal.value.assetId.toString())
    showAlert('success', 'Asset deleted successfully')
    await fetchAssets()
  } catch (error) {
    console.error('Delete error:', error)
    showAlert('error', error instanceof Error ? error.message : 'Failed to delete asset')
  } finally {
    deleteModal.value.show = false
    deleteModal.value.assetId = null
  }
}
</script>

<template>
  <div class="relative">
    <!-- Alert Component -->
    <Alert 
      :show="alert.show"
      :type="alert.type"
      :message="alert.message"
      @close="alert.show = false"
    />

    <!-- Confirmation Modal -->
    <ConfirmModal
      :show="deleteModal.show"
      title="Delete Asset"
      message="Are you sure you want to delete this asset? This action cannot be undone."
      @confirm="handleDelete"
      @cancel="deleteModal.show = false"
    />

    <!-- Asset List Table -->
    <table class="min-w-full divide-y divide-gray-200">
      <tbody>
        <tr v-for="asset in assets" :key="asset.id">
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              @click="confirmDelete(asset.id)"
              class="text-red-600 hover:text-red-900 ml-4"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>