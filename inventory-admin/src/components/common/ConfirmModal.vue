<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  message: string;
}>();

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black opacity-30"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-500">{{ message }}</p>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="emit('cancel')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="emit('confirm')"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>