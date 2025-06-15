<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PropType } from 'vue'
import type { Asset } from '@/types/asset'
import { assetApi } from '@/services/api'
import { formatDate } from '@/utils/dateFormatter'
import Alert from '@/components/common/Alert.vue'

const emit = defineEmits(['save', 'cancel'])

const props = defineProps({
  asset: {
    type: Object as PropType<Partial<Asset>>,
    default: () => ({})
  },
  mode: {
    type: String as PropType<'create' | 'edit'>,
    default: 'create'
  },
  editableFields: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const showPassword = ref(false)

const alert = ref({
  show: false,
  type: 'success',
  message: ''
})

const showAlert = (type: 'success' | 'error', message: string) => {
  alert.value = {
    show: true,
    type,
    message
  }
  // Auto hide after 3 seconds
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const isFieldDisabled = (fieldName: string) => {
  return props.mode === 'edit' && !props.editableFields.includes(fieldName)
}

const validateForm = () => {
  const requiredFields = [
    { field: 'assignee', label: 'Assignee' },
    { field: 'email_address', label: 'Email' },
    { field: 'mobile_number', label: 'Mobile Number' },
    { field: 'dept_area', label: 'Department' },
    { field: 'office', label: 'Office' },
    { field: 'sn_description', label: 'Device Description' },
    { field: 'category', label: 'Category' },
    { field: 'serial_no', label: 'Serial Number' }
  ]

  for (const { field, label } of requiredFields) {
    if (!assetForm.value[field as keyof Asset]) {
      errorMessage.value = `${label} is required`
      return false
    }
  }

  return true
}

const assetForm = ref<Partial<Asset>>({
  sn_description: '',
  category: '',
  dept_area: '',
  office: '',
  designation: '',
  assignee: '',
  email_address: '',
  password: '',
  date_issued: '',
  mobile_number: '',
  chain_of_ownership: '',
  previous_owner: '',
  remarks_date: '',
  supplier: '',
  warranty_expiration: '',
  status: '',
  condition_status: '',
  unit_value: 0,
  qty: 1,
  total_value: 0,
  model_no: '',
  serial_no: '',
  remarks: ''
})

const formatDateToWords = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  return formatDate(dateString)
}

// Add this helper function
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

onMounted(() => {
  if (props.asset && props.mode === 'edit') {
    const formattedAsset = {
      ...props.asset,
      date_issued: formatDateForInput(props.asset.date_issued),
      warranty_expiration: formatDateForInput(props.asset.warranty_expiration),
      remarks_date: formatDateToWords(props.asset.remarks_date)
    }
    Object.assign(assetForm.value, formattedAsset)
  } else if (props.asset) {
    Object.assign(assetForm.value, props.asset)
  }
})

const categories = [
  'Mobile Phone',
  'Laptop',
  'Desktop',
  'Others'
]

const offices = [
  'HQ',
  'BH'
]

const departments = [
  'Logistics',
  'Executive Office',
  'Sales',
  'Purchasing',
  'Marketing',
  'MD',
  'Sales Engineer',
  'Human Resources'
]

const office = [
  'HQ',
  'BH'
]

const statuses = [
  'Active',
  'In Use',
  'In Maintenance',
  'Disposed',
  'Lost'
]

const conditions = [
  'New',
  'Good',
  'Fair',
  'Poor',
  'Damaged'
]
const chain_of_ownership = [
  'End of Service/For Release',
  'First',
  'Second',
  'Third',
  'Fourth',
  'Transferred'
]

const handleCreate = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    errorMessage.value = null

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Please login first')
    }

    const formData = {
      ...assetForm.value,
      unit_value: Number(assetForm.value.unit_value) || 0,
      qty: Number(assetForm.value.qty) || 1,
      total_value: Number(assetForm.value.total_value) || 0,
      date_issued: assetForm.value.date_issued || null,
      warranty_expiration: assetForm.value.warranty_expiration || null,
      status: assetForm.value.status || 'Active',
      condition_status: assetForm.value.condition_status || 'New'
    }

    const response = await fetch('https://server-ue4m.onrender.com/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 409 && errorData.message?.toLowerCase().includes('serial number')) {
        errorMessage.value = 'This serial number already exists in the system. Please use a different serial number.'
        return
      }
      throw new Error(errorData.message || `Creation failed with status: ${response.status}`)
    }

    const result = await response.json()
    emit('save', result.item)
    resetForm()
    showAlert('success', 'Asset created successfully')
   
  } catch (error) {
    console.error('Form creation error:', error)
    showAlert('error', error instanceof Error ? error.message : 'Failed to create asset')
    errorMessage.value = 'The serial number already exists in the system.'
  } finally {
    isSubmitting.value = false
  }
}

// Add these helper functions at the top of the script section
const parseDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  
  try {
    // First try parsing as ISO date
    if (dateString.includes('T')) {
      return dateString
    }
    
    // Parse formatted date string (e.g. "June 14, 2025")
    const parts = dateString.split(',')
    if (parts.length === 2) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // If it's a simple date string (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateString).toISOString()
    }
    
    return dateString
  } catch (error) {
    console.error('Date parsing error:', error)
    return dateString
  }
}


const handleUpdate = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true
    errorMessage.value = null

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Please login first')
    }

    if (!props.asset?.id) {
      throw new Error('Asset ID is required for update')
    }

    const formData = {
      ...assetForm.value,
      unit_value: Number(assetForm.value.unit_value) || 0,
      qty: Number(assetForm.value.qty) || 1,
      total_value: Number(assetForm.value.total_value) || 0
    }

    // Only process dates if they exist
    if (formData.date_issued) {
      formData.date_issued = parseDate(formData.date_issued)
    }
    if (formData.warranty_expiration) {
      formData.warranty_expiration = parseDate(formData.warranty_expiration)
    }
    if (formData.remarks_date) {
      formData.remarks_date = parseDate(formData.remarks_date)
    }


    const response = await fetch(`https://server-ue4m.onrender.com/api/inventory/${props.asset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 409 && errorData.message?.toLowerCase().includes('serial number')) {
        errorMessage.value = 'Error: This serial number already exists in the system. Please use a different serial number.'
        return
      }
      throw new Error(errorData.message || `Update failed with status: ${response.status}`)
    }

    const result = await response.json()
    emit('save', result.item)
    showAlert('success', 'Asset updated successfully')
   
  } catch (error) {
    console.error('Form update error:', error)
    showAlert('error', error instanceof Error ? error.message : 'Update failed')
    if (error instanceof Error && error.message.includes('serial number')) {
      showAlert('error', 'This serial number already exists in the system. Please use a different serial number.')
    } else {
      showAlert('error', 'Failed to update asset. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const calculateTotalValue = () => {
  assetForm.value.total_value = (assetForm.value.unit_value ?? 0) * (assetForm.value.qty ?? 1)
}

const resetForm = () => {
  assetForm.value = {
    sn_description: '',
    category: '',
    dept_area: '',
    office: '',
    designation: '',
    assignee: '',
    email_address: '',
    password: '',
    date_issued: '',
    mobile_number: '',
    chain_of_ownership: '',
    previous_owner: '',
    remarks_date: '',
    supplier: '',
    warranty_expiration: '',
    status: '',
    condition_status: '',
    unit_value: 0,
    qty: 1,
    total_value: 0,
    model_no: '',
    serial_no: '',
    remarks: ''
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <Alert 
      :show="alert.show"
      :type="alert.type as 'success' | 'error'"
      :message="alert.message"
      @close="alert.show = false"
    />
   
    <form @submit.prevent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Basic Information -->
      <div class="col-span-2 space-y-4">
        <h3 class="text-lg font-medium text-gray-900 mb-6">EMPLOYEE INFO</h3>
            
        <div>
          <label class="block text-sm font-medium text-gray-700">Full Name/Assignee</label>
          <input 
            v-model="assetForm.assignee" 
            type="text"
            required 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'bg-gray-100': isFieldDisabled('assignee') }"
          />
        </div>
        <div>   
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="assetForm.email_address" required type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mobile Number</label>
          <input v-model="assetForm.mobile_number" required type="tel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        
        <div>
          <label class="block text-sm font-medium text-gray-700">Department</label>
        <select v-model="assetForm.dept_area" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>
            <option v-for="dept_area in departments" :key="dept_area" :value="dept_area">{{ dept_area }} 
            </option>
          </select>
        </div>
        

        <div>
          <label class="block text-sm font-medium text-gray-700">Office</label>
        <select v-model="assetForm.office" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>
            <option v-for="office in office" :key="office" :value="office">{{ office }} 
            </option>
          </select>
       
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Designation</label>
          <input v-model="assetForm.designation" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>

      <!-- Location Information -->
     <div class="space-y-4">
         <h3 class="text-lg font-medium text-gray-900 mb-6">DEVICE INFORMATION</h3>
       <div>
          <label class="block text-sm font-medium text-gray-700">Description/Name of Device</label>
          <input v-model="assetForm.sn_description" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

         <div>
          <label class="block text-sm font-medium text-gray-700">Tag ID</label>
          <input v-model="assetForm.tag_id" :disabled="isFieldDisabled('tag_id')"
            type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select v-model="assetForm.category" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>--Select Here Device--</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              v-model="assetForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              @click="showPassword = !showPassword"
            >
              <svg 
                class="h-5 w-5" 
                :class="showPassword ? 'hidden' : 'block'"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <svg 
                class="h-5 w-5" 
                :class="showPassword ? 'block' : 'hidden'"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Date Issued</label>
          <input 
            v-model="assetForm.date_issued" 
            type="date" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Warranty Expiration</label>
          <input 
            v-model="assetForm.warranty_expiration" 
            type="date" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Chain of Ownership</label>
       <select v-model="assetForm.chain_of_ownership" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>
            <option v-for="chain_of_ownership in chain_of_ownership" :key="chain_of_ownership" :value="chain_of_ownership">{{ chain_of_ownership }}</option>
        </select>
       
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Previous Owner</label>
          <input v-model="assetForm.previous_owner" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Remark & Date</label>
          <input v-model="assetForm.remarks_date" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="assetForm.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>  
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Condition</label>
          <select v-model="assetForm.condition_status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>  
            <option v-for="condition in conditions" :key="condition" :value="condition">{{ condition }}</option>
        </select>
        </div>

          <div>
          <label class="block text-sm font-medium text-gray-700">Supplier</label>
          <input v-model="assetForm.supplier" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

         <div>
          <label class="block text-sm font-medium text-gray-700">Model No.</label>
          <input v-model="assetForm.model_no" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Serial No.</label>
          <input
            v-model="assetForm.serial_no"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
     
      <!-- Assignment Information -->
      <div class="space-y-4">
        
        <h3 class="text-lg font-medium text-gray-900 mb-6">PRICE VALUE</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700">Unit Value</label>
          <input 
            v-model.number="assetForm.unit_value" 
            type="number" 
            @input="calculateTotalValue"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Quantity</label>
          <input 
            v-model.number="assetForm.qty" 
            type="number" 
            @input="calculateTotalValue"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Total Value</label>
          <input 
            v-model.number="assetForm.total_value" 
            disabled 
            type="number" 
            class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50" 
          />
        </div>
     <label class="block text-sm font-medium text-gray-700">Remarks</label>
        <textarea v-model="assetForm.remarks" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
       
    </div>

      <!-- Error message display -->
      <div v-if="errorMessage" class="col-span-2 p-4 bg-red-50 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>

      <!-- Form Actions -->
      <div class="col-span-2 flex justify-end space-x-3 mt-6">
        <button
          type="button"
          @click="$emit('cancel')"
          :disabled="isSubmitting"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        
        <!-- Create button - only show in create mode -->
        <button
          v-if="props.mode === 'create'"
          type="button"
          :disabled="isSubmitting"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleCreate"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Asset' }}
        </button>
        
        <!-- Update button - only show in edit mode -->
        <button
          v-if="props.mode === 'edit'"
          type="button"
          :disabled="isSubmitting"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleUpdate"
        >
          {{ isSubmitting ? 'Updating...' : 'Update Asset' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.required:after {
  content: " *";
  color: red;
}

input:required, select:required {
  border-color: #e5e7eb;
}

input:required:invalid, select:required:invalid {
  border-color: #ef4444;
}
</style>