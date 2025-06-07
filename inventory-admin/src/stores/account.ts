import { defineStore } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import type { Account } from '@/types/account';
import { accountApi } from '@/services/api';

export const useAccountStore = defineStore('account', () => {
  const items = ref<Account[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = ref(10);
  const roleFilter = ref('');
  const sortOrder = ref<'ASC' | 'DESC'>('ASC');

  const fetchAccounts = async () => {
    try {
      loading.value = true;
      const response = await accountApi.getAll({
        page: currentPage.value,
        limit: itemsPerPage.value,
        roleFilter: roleFilter.value,
        sortOrder: sortOrder.value
      });
      
      items.value = response.items;
      totalPages.value = response.pagination.pages;
      totalItems.value = response.pagination.total;
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    roleFilter,
    sortOrder,
    fetchAccounts
  };
});