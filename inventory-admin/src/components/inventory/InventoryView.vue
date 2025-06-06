<template>
  <table>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td class="px-6 py-4 whitespace-nowrap">
          <span :class="getStatusClass(item.status)" class="px-2 py-1 rounded-full text-xs font-medium">
            {{ item.status }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
interface Item {
  id: number;
  status: string;
  // Add other properties you need
}

// Define props with proper typing
defineProps<{
  items: Item[] // Change to array of items
}>();

const getStatusClass = (status: string) => {
  const statusClasses = {
    'Active': 'bg-green-100 text-green-800',
    'In Use': 'bg-blue-100 text-blue-800',
    'In Maintenance': 'bg-yellow-100 text-yellow-800',
    'Disposed': 'bg-gray-100 text-gray-800',
    'Lost': 'bg-red-100 text-red-800'
  } as const

  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
}
</script>