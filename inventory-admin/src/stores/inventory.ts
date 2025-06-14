import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Asset } from '@/types/asset';
import { assetApi } from '@/services/api';

interface GetAllParams {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
  dept_area?: string;
  status?: string;
  condition_status?: string;
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<Asset[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = ref(20);
  const searchQuery = ref('');
  const filters = ref({
    category: '',
    dept_area: '',
    status: '',
    condition_status: ''
  });
  const sortBy = ref('');
  const sortOrder = ref('ASC');

  const fetchItems = async () => {
    try {
      loading.value = true;
      const response = await assetApi.getAll({
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        ...filters.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      } as GetAllParams);
      
      items.value = response.items;
      totalPages.value = response.pagination.pages;
      totalItems.value = response.pagination.total;
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      loading.value = false;
    }
  };

  const addItem = (item: Asset) => {
    items.value = [item, ...items.value]
    totalItems.value++
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(item => item.id !== id)
    totalItems.value--
  }

  const updateItem = (updatedItem: Asset) => {
    const index = items.value.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  }

  return {
    items,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    fetchItems,
    addItem,
    removeItem,
    updateItem
  };
});