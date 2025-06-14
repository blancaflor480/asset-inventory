<script setup lang="ts">
defineProps<{
  show: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black opacity-30"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div class="p-6">
          <!-- Icon and Title -->
          <div class="flex items-center mb-4">
            <!-- Success Icon -->
            <div v-if="type === 'success'" 
                 class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <!-- Error Icon -->
            <div v-else-if="type === 'error'"
                 class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <!-- Warning Icon -->
            <div v-else
                 class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg font-medium leading-6 text-gray-900" 
                :class="{
                  'text-green-700': type === 'success',
                  'text-red-700': type === 'error',
                  'text-yellow-700': type === 'warning'
                }">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">{{ message }}</p>
            </div>
          </div>

          <div class="mt-5 sm:mt-6">
            <button
              @click="emit('close')"
              class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>