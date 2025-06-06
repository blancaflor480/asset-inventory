<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PropType } from 'vue'
import type { Asset } from '@/types/asset'
import { assetApi } from '@/services/api' // Add this import

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
  // Add editable fields prop
  editableFields: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})

// Add computed property for field disabled state
const isFieldDisabled = (fieldName: string) => {
  return props.mode === 'edit' && !props.editableFields.includes(fieldName)
}

const validateForm = () => {
  const requiredFields = [
    { field: 'sn_description', label: 'Description' },
    { field: 'category', label: 'Category' },
    { field: 'dept_area', label: 'Department' },
    { field: 'office', label: 'Office' },
    { field: 'assignee', label: 'Assignee' },
    { field: 'email_address', label: 'Email' },
    { field: 'mobile_number', label: 'Mobile Number' }
  ]

  for (const { field, label } of requiredFields) {
    if (!assetForm.value[field as keyof Asset]) {
      alert(`${label} is required`)
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

// Initialize form with props if editing
onMounted(() => {
  if (props.asset) {
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
const isSubmitting = ref(false)

// Separate function for creating new asset
const handleCreate = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true

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

    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`Creation failed with status: ${response.status}`)
    }

    const result = await response.json()
    emit('save', result.item)
    resetForm()
    alert('Asset created successfully')

  } catch (error) {
    console.error('Form creation error:', error)
    alert('Error creating asset: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    isSubmitting.value = false
  }
}

// Separate function for updating existing asset
const handleUpdate = async () => {
  if (isSubmitting.value) return
  
  try {
    isSubmitting.value = true

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
      total_value: Number(assetForm.value.total_value) || 0,
      date_issued: assetForm.value.date_issued || null,
      warranty_expiration: assetForm.value.warranty_expiration || null,
      status: assetForm.value.status || 'Active',
      condition_status: assetForm.value.condition_status || 'New'
    }

    const response = await fetch(`/api/inventory/${props.asset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`Update failed with status: ${response.status}`)
    }

    const result = await response.json()
    emit('save', result.item)
    alert('Asset updated successfully')

  } catch (error) {
    console.error('Form update error:', error)
    alert('Error updating asset: ' + (error instanceof Error ? error.message : String(error)))
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
    <form @submit.prevent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Basic Information -->
      <div class="col-span-2 space-y-4">
        <h3 class="text-lg font-medium text-gray-900 mb-6">EMPLOYEE INFO</h3>
            
        <div>
          <label class="block text-sm font-medium text-gray-700">Full Name/Assignee</label>
          <input 
            v-model="assetForm.assignee" 
            type="text" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'bg-gray-100': isFieldDisabled('assignee') }"
          />
        </div>
        <div>   
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="assetForm.email_address" type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mobile Number</label>
          <input v-model="assetForm.mobile_number" type="tel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        
        <div>
          <label class="block text-sm font-medium text-gray-700">Department</label>
        <select v-model="assetForm.dept_area" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select Here</option>
            <option v-for="dept_area in departments" :key="dept_area" :value="dept_area">{{ dept_area }} 
            </option>
          </select>
        </div>
        

        <div>
          <label class="block text-sm font-medium text-gray-700">Office</label>
        <select v-model="assetForm.office" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
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
          <input v-model="assetForm.sn_description" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

         <div>
          <label class="block text-sm font-medium text-gray-700">Tag ID</label>
          <input v-model="assetForm.tag_id" :disabled="isFieldDisabled('tag_id')"
            type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select v-model="assetForm.category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>--Select Here Device--</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="assetForm.password" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Date Issued</label>
          <input v-model="assetForm.date_issued" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Warranty Expiration</label>
          <input v-model="assetForm.warranty_expiration" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
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
          <input v-model="assetForm.serial_no" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
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