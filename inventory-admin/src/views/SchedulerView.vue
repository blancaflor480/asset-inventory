<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { useUserStore } from '@/stores/user'
import { API_BASE_URL } from '@/config/api';
import type { Bookings } from '@/types/scheduler'

const bookings = ref<Bookings[]>([])
const showModal = ref(false)
const showApprovalsModal = ref(false)
const activeTab = ref('pending') // 'pending' or 'history'
const newBooking = ref({
  room_name: '',
  purpose: '',
  start_time: '',
  end_time: ''
})
const rooms = ['Conference Room A', 'Conference Room B']
const userStore = useUserStore()

const pendingBookings = computed(() => {
  return bookings.value.filter(b => b.status === 'Pending')
})

const historyBookings = computed(() => {
  return bookings.value.filter(b => ['Approved', 'Rejected', 'Cancelled'].includes(b.status || ''))
})

const approvedBookings = computed(() => {
  return bookings.value.filter(b => b.status === 'Approved')
})

const isAdmin = computed(() => {
  return userStore.user?.role === 'Superadmin' || userStore.user?.role === 'Admin'
})

// Helper function to format time in 12-hour format
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const fetchBookings = async () => {
  const res = await axios.get(`${API_BASE_URL}/bookings`, {
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  })
  bookings.value = Array.isArray(res.data) ? res.data : []
}

const handleAddBooking = async () => {
  await axios.post(`${API_BASE_URL}/bookings`, newBooking.value, {
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  })
  showModal.value = false
  newBooking.value = {
    room_name: '',
    purpose: '',
    start_time: '',
    end_time: ''
  }
  fetchBookings()
}

const handleCancelBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  })
  fetchBookings()
}

const approveBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/status`, { status: 'Approved' }, {
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  })
  fetchBookings()
}

const rejectBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/status`, { status: 'Rejected' }, {
    headers: {
      Authorization: `Bearer ${userStore.token}`
    }
  })
  fetchBookings()
}

const showEventDetails = (event: { content: any }) => {
  const booking = event.content
  const startTime = formatTime(booking.start_time)
  const endTime = formatTime(booking.end_time)
  const details = `
Room: ${booking.room_name}
Purpose: ${booking.purpose}
Time: ${startTime} - ${endTime}
Booked by: ${booking.booked_by}
Status: ${booking.status}
  `
  alert(details)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800'
    case 'Approved': return 'bg-green-100 text-green-800'
    case 'Rejected': return 'bg-red-100 text-red-800'
    case 'Cancelled': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getEventColor = (booking: Bookings) => {
  switch (booking.status) {
    case 'Approved': return '#10b981' // green
    case 'Pending': return '#f59e0b' // yellow
    case 'Rejected': return '#ef4444' // red
    case 'Cancelled': return '#6b7280' // gray
    default: return '#6b7280'
  }
}

onMounted(fetchBookings)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Conference Room Scheduler</h1>
    
    <!-- Action Buttons -->
    <div class="flex gap-4 mb-4">
      <button class="btn-primary" @click="showModal = true">Add Booking</button>
      <button 
        v-if="isAdmin" 
        class="btn-secondary relative" 
        @click="showApprovalsModal = true"
      >
        Manage Bookings
        <span 
          v-if="pendingBookings.length > 0" 
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center"
        >
          {{ pendingBookings.length }}
        </span>
      </button>
    </div>

    <!-- Calendar showing only approved bookings -->
    <vue-cal
      style="height: 600px"
      :events="approvedBookings.map(b => ({
        start: b.start_time,
        end: b.end_time,
        title: `${b.purpose}`,
        content: b,
        class: 'approved-booking',
        backgroundColor: getEventColor(b)
      }))"
      @event-click="showEventDetails"
    />

    <!-- Add Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 class="text-lg font-bold mb-2">New Booking</h2>
        <form @submit.prevent="handleAddBooking">
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Room</label>
            <select v-model="newBooking.room_name" required class="w-full border rounded p-2">
              <option value="">Select Room</option>
              <option v-for="room in rooms" :key="room" :value="room">{{ room }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Purpose</label>
            <input v-model="newBooking.purpose" required class="w-full border rounded p-2" />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">Start Time</label>
            <input v-model="newBooking.start_time" type="datetime-local" required class="w-full border rounded p-2" />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium mb-1">End Time</label>
            <input v-model="newBooking.end_time" type="datetime-local" required class="w-full border rounded p-2" />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Bookings Modal with Tabs -->
    <div v-if="showApprovalsModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-6xl max-h-[80vh] overflow-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Manage Bookings</h2>
          <button 
            class="text-gray-500 hover:text-gray-700 text-xl font-bold"
            @click="showApprovalsModal = false"
          >
            ×
          </button>
        </div>
        
        <!-- Tabs -->
        <div class="flex mb-6 border-b">
          <button 
            :class="['px-4 py-2 font-medium', activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
            @click="activeTab = 'pending'"
          >
            Pending Approvals
            <span 
              v-if="pendingBookings.length > 0" 
              class="ml-2 bg-red-500 text-white rounded-full text-xs px-2 py-1"
            >
              {{ pendingBookings.length }}
            </span>
          </button>
          <button 
            :class="['px-4 py-2 font-medium', activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
            @click="activeTab = 'history'"
          >
            History
          </button>
        </div>
        
        <!-- Pending Approvals Tab -->
        <div v-if="activeTab === 'pending'">
          <div v-if="pendingBookings.length === 0" class="text-center py-8 text-gray-500">
            No pending approvals
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full border border-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left border-b">Room</th>
                  <th class="px-4 py-2 text-left border-b">Purpose</th>
                  <th class="px-4 py-2 text-left border-b">Start</th>
                  <th class="px-4 py-2 text-left border-b">End</th>
                  <th class="px-4 py-2 text-left border-b">Booked By</th>
                  <th class="px-4 py-2 text-left border-b">Status</th>
                  <th class="px-4 py-2 text-left border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in pendingBookings" :key="b.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2 border-b">{{ b.room_name }}</td>
                  <td class="px-4 py-2 border-b">{{ b.purpose }}</td>
                  <td class="px-4 py-2 border-b">{{ formatDateTime(b.start_time) }}</td>
                  <td class="px-4 py-2 border-b">{{ formatDateTime(b.end_time) }}</td>
                  <td class="px-4 py-2 border-b">{{ b.booked_by }}</td>
                  <td class="px-4 py-2 border-b">
                    <span :class="['px-2 py-1 rounded text-sm', getStatusColor(b.status || '')]">
                      {{ b.status }}
                    </span>
                  </td>
                  <td class="px-4 py-2 border-b">
                    <div class="flex gap-2">
                      <button
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        @click="b.id !== undefined && approveBooking(b.id)"
                      >
                        Approve
                      </button>
                      <button
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        @click="b.id !== undefined && rejectBooking(b.id)"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- History Tab -->
        <div v-if="activeTab === 'history'">
          <div v-if="historyBookings.length === 0" class="text-center py-8 text-gray-500">
            No booking history
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full border border-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left border-b">Room</th>
                  <th class="px-4 py-2 text-left border-b">Purpose</th>
                  <th class="px-4 py-2 text-left border-b">Start</th>
                  <th class="px-4 py-2 text-left border-b">End</th>
                  <th class="px-4 py-2 text-left border-b">Booked By</th>
                  <th class="px-4 py-2 text-left border-b">Status</th>
                  <th class="px-4 py-2 text-left border-b">Date Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in historyBookings" :key="b.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2 border-b">{{ b.room_name }}</td>
                  <td class="px-4 py-2 border-b">{{ b.purpose }}</td>
                  <td class="px-4 py-2 border-b">{{ formatDateTime(b.start_time) }}</td>
                  <td class="px-4 py-2 border-b">{{ formatDateTime(b.end_time) }}</td>
                  <td class="px-4 py-2 border-b">{{ b.booked_by }}</td>
                  <td class="px-4 py-2 border-b">
                    <span :class="['px-2 py-1 rounded text-sm', getStatusColor(b.status || '')]">
                      {{ b.status }}
                    </span>
                  </td>
                  <td class="px-4 py-2 border-b">{{ b.updated_at ? formatDateTime(b.updated_at) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approved-booking {
  border-radius: 4px;
  color: white;
  font-weight: 500;
}
</style>