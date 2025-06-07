<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAccountStore } from '@/stores/account';
import { accountApi } from '@/services/accountApi';
import type { Account } from '@/types/account';

const store = useAccountStore();
const showForm = ref(false);
const showEditModal = ref(false);
const selectedAccount = ref<Account | null>(null);
const newAccount = ref<Partial<Account> & { password?: string }>({
  username: '',
  email: '',
  password: '',
  role: '',
  status: 'Active'
});

const roles = ['Admin', 'Manager', 'User'];

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'last_login', label: 'Last Login' }
] as const;

// Computed properties for form fields
const formUsername = computed({
  get: () => showEditModal.value ? selectedAccount.value?.username || '' : newAccount.value.username || '',
  set: (value: string) => {
    if (showEditModal.value && selectedAccount.value) {
      selectedAccount.value.username = value;
    } else {
      newAccount.value.username = value;
    }
  }
});

const formEmail = computed({
  get: () => showEditModal.value ? selectedAccount.value?.email || '' : newAccount.value.email || '',
  set: (value: string) => {
    if (showEditModal.value && selectedAccount.value) {
      selectedAccount.value.email = value;
    } else {
      newAccount.value.email = value;
    }
  }
});

const formPassword = computed({
  get: () => showEditModal.value ? '' : newAccount.value.password || '',
  set: (value: string) => {
    if (!showEditModal.value) {
      newAccount.value.password = value;
    }
    // Do not set password on selectedAccount, as Account type does not have password
  }
});

const formRole = computed({
  get: () => showEditModal.value ? selectedAccount.value?.role || '' : newAccount.value.role || '',
  set: (value: string) => {
    if (showEditModal.value && selectedAccount.value) {
      selectedAccount.value.role = value;
    } else {
      newAccount.value.role = value;
    }
  }
});

const formStatus = computed({
  get: () => showEditModal.value ? selectedAccount.value?.status || 'Active' : newAccount.value.status || 'Active',
  set: (value: string) => {
    if (showEditModal.value && selectedAccount.value) {
      selectedAccount.value.status = value;
    } else {
      newAccount.value.status = value;
    }
  }
});

onMounted(() => {
  store.fetchAccounts();
});

const handleSort = () => {
  store.sortOrder = store.sortOrder === 'ASC' ? 'DESC' : 'ASC';
  store.fetchAccounts();
};

const handleRoleFilter = (role: string) => {
  if (role === null || role === undefined) return;
  store.roleFilter = role;
  store.currentPage = 1;
  store.fetchAccounts();
};

const handleCreateAccount = async () => {
  try {
    if (!newAccount.value.username || !newAccount.value.email || !newAccount.value.password || !newAccount.value.role) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Submitting account:', newAccount.value); // Debug log
    
    await accountApi.create(newAccount.value);
    await store.fetchAccounts();
    showForm.value = false;
    
    // Reset form
    newAccount.value = {
      username: '',
      email: '',
      password: '',
      role: '',
      status: 'Active'
    };
    
    alert('Account created successfully!');
  } catch (error) {
    console.error('Error creating account:', error);
    alert('Failed to create account: ' + (error instanceof Error ? error.message : String(error)));
  }
};

const handleUpdateAccount = async (account: Account) => {
  if (!selectedAccount.value?.id) return;
  
  try {
    // Create update payload without password if it's empty
    const updatePayload = {
      ...account,
      // Only include password if it's not empty
      ...(account.password ? { password: account.password } : {})
    };

    await accountApi.update(selectedAccount.value.id.toString(), updatePayload);
    await store.fetchAccounts();
    showEditModal.value = false;
    selectedAccount.value = null;
    alert('Account updated successfully!');
  } catch (error) {
    console.error('Error updating account:', error);
    alert('Failed to update account: ' + (error instanceof Error ? error.message : String(error)));
  }
};

const handleDeleteAccount = async (account: Account) => {
  if (!account.id) return;
  
  if (confirm('Are you sure you want to delete this account?')) {
    try {
      await accountApi.delete(account.id.toString());
      store.fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  }
};
</script>

<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Account Management</h1>
        <button
          @click="showForm = true"
          class="btn-primary"
        >
          Add New Account
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex items-center gap-4">
        <select
          v-model="store.roleFilter"
          @change="handleRoleFilter(($event.target as HTMLSelectElement).value)"
          class="rounded-md border-gray-300"
        >
          <option value="">All Roles</option>
          <option v-for="role in roles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>

        <button
          @click="handleSort"
          class="flex items-center gap-2 px-4 py-2 border rounded-md"
        >
          <span>Sort by Username</span>
          <span class="material-icons-outlined">
            {{ store.sortOrder === 'ASC' ? 'arrow_upward' : 'arrow_downward' }}
          </span>
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white shadow-sm rounded-lg overflow-hidden">
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
                {{ item[column.key as keyof Account] }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="selectedAccount = item; showEditModal = true"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="handleDeleteAccount(item)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Account Form Modal -->
    <div
      v-if="showForm || showEditModal"
      class="fixed inset-0 overflow-hidden z-50"
      @click.self="showForm = false; showEditModal = false"
    >
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">
              {{ showEditModal ? 'Edit Account' : 'New Account' }}
            </h2>
            <button
              @click="showForm = false; showEditModal = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="handleCreateAccount">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="newAccount.username"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="newAccount.email"
                  type="email"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  v-model="newAccount.password"
                  type="password"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="newAccount.role"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="">Select Role</option>
                  <option v-for="role in roles" :key="role" :value="role">
                    {{ role }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="newAccount.status"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="btn-secondary"
                @click="showForm = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Form Modal -->
    <div v-if="showEditModal" class="fixed inset-0 overflow-hidden z-50">
      <div class="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">Edit Account</h2>
            <button
              @click="showEditModal = false"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="material-icons-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="handleUpdateAccount(selectedAccount!)">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  v-model="selectedAccount!.username"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="selectedAccount!.email"
                  type="email"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <select
                  v-model="selectedAccount!.role"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option v-for="role in roles" :key="role" :value="role">
                    {{ role }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Status</label>
                <select
                  v-model="selectedAccount!.status"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">New Password (optional)</label>
                <input
                  v-model="selectedAccount!.password"
                  type="password"
                  class="mt-1 block w-full rounded-md border-gray-300"
                />
                <p class="mt-1 text-sm text-gray-500">Leave blank to keep current password</p>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="btn-secondary"
                @click="showEditModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
              >
                Update Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  background-color: #4f46e5;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: #f3f4f6;
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: #e5e7eb;
}
</style>