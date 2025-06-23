<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { useUserStore } from '@/stores/user'
import { API_BASE_URL } from '@/config/api';
import type { Scheduler } from '@/types/scheduler'

const bookings = ref<Scheduler[]>([])
const showModal = ref(false)
const newBooking = ref({
  room_name: '',
  purpose: '',
  start_time: '',
  end_time: ''
})
const rooms = ['Conference Room A', 'Conference Room B']
const userStore = useUserStore()

const fetchBookings = async () => {
  const res = await axios.get('https://server-ue4m.onrender.com/api/bookings')
  bookings.value = res.data
}

const handleAddBooking = async () => {
  await axios.post(`${API_BASE_URL}/bookings`, newBooking.value)
  showModal.value = false
  fetchBookings()
}

const handleCancelBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/cancel`)
  fetchBookings()
}

const approveBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/status`, { status: 'Approved' })
  fetchBookings()
}

const rejectBooking = async (id: number) => {
  await axios.put(`${API_BASE_URL}/bookings/${id}/status`, { status: 'Rejected' })
  fetchBookings()
}

const showEventDetails = (event: { content: any }) => {
  alert(JSON.stringify(event.content, null, 2))
}

onMounted(fetchBookings)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Conference Room Scheduler</h1>
    <button class="btn-primary mb-4" @click="showModal = true">Add Booking</button>
    <vue-cal
      style="height: 600px"
      :events="bookings.map(b => ({
        start: b.start_time,
        end: b.end_time,
        title: `${b.room_name} - ${b.purpose} (${b.status || ''})`,
        content: b
      }))"
      @event-click="showEventDetails"
    />

    <!-- Add Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div class="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 class="text-lg font-bold mb-2">New Booking</h2>
        <form @submit.prevent="handleAddBooking">
          <div class="mb-2">
            <label>Room</label>
            <select v-model="newBooking.room_name" required class="w-full border rounded p-2">
              <option value="">Select Room</option>
              <option v-for="room in rooms" :key="room" :value="room">{{ room }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label>Purpose</label>
            <input v-model="newBooking.purpose" required class="w-full border rounded p-2" />
          </div>
          <div class="mb-2">
            <label>Start Time</label>
            <input v-model="newBooking.start_time" type="datetime-local" required class="w-full border rounded p-2" />
          </div>
          <div class="mb-2">
            <label>End Time</label>
            <input v-model="newBooking.end_time" type="datetime-local" required class="w-full border rounded p-2" />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Pending Approvals Table -->
    <div v-if="userStore.user?.role === 'Superadmin' || userStore.user?.role === 'Admin'" class="mt-8">
      <h2 class="text-lg font-semibold mb-2">Pending Approvals</h2>
      <table class="min-w-full border">
        <thead>
          <tr>
            <th>Room</th>
            <th>Purpose</th>
            <th>Start</th>
            <th>End</th>
            <th>Booked By</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in bookings.filter(b => b.status === 'Pending')" :key="b.id">
            <td>{{ b.room_name }}</td>
            <td>{{ b.purpose }}</td>
            <td>{{ b.start_time }}</td>
            <td>{{ b.end_time }}</td>
            <td>{{ b.booked_by }}</td>
            <td>{{ b.status }}</td>
            <td>
              <button
                class="btn-primary mr-2"
                @click="b.id !== undefined && approveBooking(b.id)"
              >Approve</button>
              <button
                class="btn-secondary"
                @click="b.id !== undefined && rejectBooking(b.id)"
              >Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>