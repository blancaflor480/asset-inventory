<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useInventoryStore } from '@/stores/inventory';
import AssetForm from '@/components/inventory/AssetForm.vue';
import AssetFilters from '@/components/inventory/AssetFilters.vue';
import type { Asset } from '@/types/asset';
import { assetApi } from '@/services/api';
import AlertModal from '@/components/common/AlertModal.vue'
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal.vue'


const store = useInventoryStore();
const showForm = ref(false);
const showViewModal = ref(false);
const showEditModal = ref(false);
const selectedAsset = ref<Asset | null>(null);

const columns = [
  { key: 'tag_id', label: 'Tag ID' },
  { key: 'sn_description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'dept_area', label: 'Department' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' }
] as const;

onMounted(() => {
  store.fetchItems();
});

const handleSearch = () => {
  store.currentPage = 1;
  store.fetchItems();
};

const handleFilter = (filters: any) => {
  store.filters = filters;
  store.currentPage = 1;
  store.fetchItems();
};

const handleSort = (sort: { sortBy: string; sortOrder: string }) => {
  store.sortBy = sort.sortBy;
  store.sortOrder = sort.sortOrder;
  store.fetchItems();
};

const handlePageChange = (page: number) => {
  store.currentPage = page;
  store.fetchItems();
};

const handleViewAsset = (asset: Asset) => {
  selectedAsset.value = asset;
  showViewModal.value = true;
};

const handleEditAsset = (asset: Asset) => {
  selectedAsset.value = asset;
  showEditModal.value = true;
};
const alertModal = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: ''
})

const deleteModal = ref({
  show: false,
  assetToDelete: null as Asset | null
})

const confirmDelete = (asset: Asset) => {
  deleteModal.value = {
    show: true,
    assetToDelete: asset
  }
}

const handleDeleteAsset = async () => {
  if (!deleteModal.value.assetToDelete?.id) return
  
  try {
    await assetApi.delete(deleteModal.value.assetToDelete.id.toString())
    
    // Remove from store
    store.removeItem(deleteModal.value.assetToDelete.id)
    
    alertModal.value = {
      show: true,
      type: 'success',
      title: 'Asset Deleted',
      message: 'The asset has been successfully deleted.'
    }
    
  } catch (error) {
    alertModal.value = {
      show: true,
      type: 'error',
      title: 'Delete Failed',
      message: error instanceof Error ? error.message : 'Failed to delete asset'
    }
  } finally {
    // Close the confirmation modal
    deleteModal.value = {
      show: false,
      assetToDelete: null
    }
  }
}


const handleUpdateAsset = async (asset: Asset) => {
  try {
    await assetApi.update(asset.id!.toString(), asset)
    
    alertModal.value = {
      show: true,
      type: 'success',
      title: 'Asset Updated',
      message: 'The asset has been successfully updated.'
    }
    
    await store.fetchItems()
    showEditModal.value = false
    
  } catch (error) {
    alertModal.value = {
      show: true,
      type: 'error',
      title: 'Update Failed',
      message: error instanceof Error ? error.message : 'Failed to update asset'
    }
  }
};

const handleSaveAsset = async (asset: Partial<Asset>) => {
  try {
    await assetApi.create(asset)
    
    alertModal.value = {
      show: true,
      type: 'success',
      title: 'Asset Created',
      message: 'The new asset has been successfully created.'
    }
    
    await store.fetchItems()
    showForm.value = false
    
  } catch (error) {
    alertModal.value = {
      show: true,
      type: 'error',
      title: 'Creation Failed',
      message: error instanceof Error ? error.message : 'Failed to create asset'
    }
  }
};
</script>

<template>

  <div class="py-6">
    <!-- Alert Modal -->
    <AlertModal 
      v-bind="alertModal"
      @close="alertModal.show = false"
    />
    
    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal
      :show="deleteModal.show"
      title="Delete Asset"
      message="Are you sure you want to delete this asset? This action cannot be undone."
      @confirm="handleDeleteAsset"
      @cancel="deleteModal.show = false"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Inventory Assets</h1>
        <button
          @click="showForm = true"
          class="btn-primary"
        >
          Add New Asset
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6">
        <div class="flex gap-4 mb-4">
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="Search assets..."
            class="flex-1 min-w-0"
            @input="handleSearch"
          />
        </div>
        <AssetFilters @filter="handleFilter" @sort="handleSort" />
      </div>

      <!-- Table -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.label }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in store.items" :key="item.id">
                <td
                  v-for="column in columns"
                  :key="column.key"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {{ item[column.key as keyof Asset] }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="handleViewAsset(item)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button 
                    @click="handleEditAsset(item)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    @click="confirmDelete(item)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="handlePageChange(store.currentPage - 1)"
              :disabled="store.currentPage === 1"
              class="btn-secondary"
            >
              Previous
            </button>
            <button
              @click="handlePageChange(store.currentPage + 1)"
              :disabled="store.currentPage === store.totalPages"
              class="btn-secondary"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                {{ ((store.currentPage - 1) * store.itemsPerPage) + 1 }}
                to
                {{ Math.min(store.currentPage * store.itemsPerPage, store.totalItems) }}
                of
                {{ store.totalItems }}
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  v-for="page in store.totalPages"
                  :key="page"
                  @click="handlePageChange(page)"
                  :class=" [
                    'btn-secondary',
                    store.currentPage === page ? 'bg-indigo-50 text-indigo-600' : ''
                  ]"
                >
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showForm || showEditModal"
      class="fixed inset-0 overflow-hidden z-50"
      @click.self="showForm = false; showEditModal = false"
    >
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto w-screen max-w-4xl">
              <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div class="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2 class="text-lg font-medium text-gray-900">
                      {{ showEditModal ? 'Edit Asset' : 'New Asset' }}
                    </h2>
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      @click="showForm = false; showEditModal = false"
                    >
                      <span class="sr-only">Close panel</span>
                      <span class="material-icons-outlined">close</span>
                    </button>
                  </div>
                  <div class="mt-8">
                    <AssetForm 
                      :asset="showEditModal ? (selectedAsset || undefined) : undefined"
                      :mode="showEditModal ? 'edit' : 'create'"
                      @save="showEditModal ? handleUpdateAsset : handleSaveAsset" 
                      @cancel="showForm = false; showEditModal = false" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 overflow-hidden z-50"
      @click.self="showViewModal = false"
    >
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto w-screen max-w-2xl">
              <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div class="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2 class="text-lg font-medium text-gray-900">Asset Details</h2>
                    <button
                      type="button"
                      class="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      @click="showViewModal = false"
                    >
                      <span class="sr-only">Close panel</span>
                      <span class="material-icons-outlined">close</span>
                    </button>
                  </div>
                  <div class="mt-8">
                    <dl class="space-y-4">
                      <template v-if="selectedAsset">
                        <div v-for="(value, key) in selectedAsset" :key="key">
                          <dt class="text-sm font-medium text-gray-500">{{ key }}</dt>
                          <dd class="mt-1 text-sm text-gray-900">{{ value }}</dd>
                        </div>
                      </template>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

