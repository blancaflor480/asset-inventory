<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  type: 'success' | 'error'
  message: string
  show: boolean
}>()

const emit = defineEmits(['close'])

const bgColor = {
  success: 'bg-green-100 border-green-400 text-green-700',
  error: 'bg-red-100 border-red-400 text-red-700'
}

const iconColor = {
  success: 'text-green-500',
  error: 'text-red-500'
}
</script>

<template>
  <div v-if="show" class="fixed top-4 right-4 z-50">
    <div :class="`${bgColor[type]} border px-4 py-3 rounded relative max-w-md`" role="alert">
      <div class="flex items-center">
        <!-- Success Icon -->
        <svg v-if="type === 'success'" class="w-5 h-5 mr-2" :class="iconColor[type]" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <!-- Error Icon -->
        <svg v-else class="w-5 h-5 mr-2" :class="iconColor[type]" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="block sm:inline">{{ message }}</span>
      </div>
      <button @click="emit('close')" class="absolute top-0 right-0 p-2">
        <svg class="w-4 h-4" :class="iconColor[type]" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>