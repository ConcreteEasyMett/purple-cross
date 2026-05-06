<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useEmployeesStore } from '@/stores/employees'
import EmploymentStatusChip from '@/components/EmploymentStatusChip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmployeeFormDialog from '@/components/EmployeeFormDialog.vue'
import { employmentStatus, terminationStatus } from '@/utils/employeeStatus'
import { useSnackbar } from '@/composables/useSnackbar'
import type { Employee } from '@/types/employee'

const router = useRouter()
const snackbar = useSnackbar()

function viewEmployee(code: string) {
  router.push({ name: 'employee-profile', params: { code } })
}

const store = useEmployeesStore()
const { employees } = storeToRefs(store)

const deleteTarget = ref<Employee | null>(null)
const confirmOpen = ref(false)
const createOpen = ref(false)

function openCreate() {
  createOpen.value = true
}

function askDelete(employee: Employee) {
  deleteTarget.value = employee
  confirmOpen.value = true
}

function cancelDelete() {
  confirmOpen.value = false
  deleteTarget.value = null
}

function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  store.remove(target.code)
  snackbar.success(`Employee ${target.code} deleted`)
  confirmOpen.value = false
  deleteTarget.value = null
}

const search = ref('')
const departmentFilter = ref<string | null>(null)
const occupationFilter = ref<string | null>(null)
type StatusOption = 'Currently employed' | 'Employed soon' | 'Terminated' | 'To be terminated'
const statusFilter = ref<StatusOption | null>(null)

const departmentOptions = computed(() => store.departments)
const occupationOptions = computed(() => store.occupations)
const statusOptions = [
  'Currently employed',
  'Employed soon',
  'Terminated',
  'To be terminated',
] as const

const headers = [
  { title: 'Code', key: 'code', sortable: true, width: 110 },
  { title: 'Full Name', key: 'fullName', sortable: true },
  { title: 'Occupation', key: 'occupation', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Date of Employment', key: 'dateOfEmployment', sortable: true },
  { title: 'Termination Date', key: 'terminationDate', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const, width: 160 },
]

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return employees.value.filter((emp) => {
    if (term) {
      const haystack = `${emp.code} ${emp.fullName} ${emp.occupation}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    if (departmentFilter.value && emp.department !== departmentFilter.value) return false
    if (occupationFilter.value && emp.occupation !== occupationFilter.value) return false
    if (statusFilter.value) {
      const matches =
        employmentStatus(emp.dateOfEmployment) === statusFilter.value ||
        terminationStatus(emp.terminationDate) === statusFilter.value
      if (!matches) return false
    }
    return true
  })
})

const total = computed(() => employees.value.length)
const matchCount = computed(() => filtered.value.length)

const hasActiveFilter = computed(
  () =>
    search.value.trim().length > 0 ||
    departmentFilter.value !== null ||
    occupationFilter.value !== null ||
    statusFilter.value !== null,
)

function clearFilters() {
  search.value = ''
  departmentFilter.value = null
  occupationFilter.value = null
  statusFilter.value = null
}
</script>

<template>
  <v-card>
    <v-card-item>
      <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 16px">
        <div>
          <v-card-title class="px-0 text-h6">Employees</v-card-title>
          <v-card-subtitle class="px-0 text-medium-emphasis">
            <template v-if="hasActiveFilter">
              {{ matchCount }} of {{ total }} {{ total === 1 ? 'record' : 'records' }} shown
            </template>
            <template v-else>
              {{ total }} {{ total === 1 ? 'record' : 'records' }} on file
            </template>
          </v-card-subtitle>
        </div>
      </div>
    </v-card-item>

    <v-divider />

    <div class="px-4 py-3">
      <v-row dense align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search name, code, occupation"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="departmentFilter"
            :items="departmentOptions"
            label="Department"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select
            v-model="occupationFilter"
            :items="occupationOptions"
            label="Occupation"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Status"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="1" class="d-flex justify-md-end">
          <v-btn
            v-if="hasActiveFilter"
            variant="text"
            size="small"
            prepend-icon="mdi-filter-remove-outline"
            @click="clearFilters"
          >
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <v-divider />

    <v-data-table
      :headers="headers"
      :items="filtered"
      item-value="code"
      :items-per-page="25"
      :items-per-page-options="[10, 25, 50, 100]"
      density="comfortable"
      hover
    >
      <template #[`item.dateOfEmployment`]="{ item }">
        <EmploymentStatusChip :date="item.dateOfEmployment" kind="employment" />
      </template>

      <template #[`item.terminationDate`]="{ item }">
        <EmploymentStatusChip :date="item.terminationDate" kind="termination" />
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex justify-end" style="gap: 4px">
          <v-btn
            icon="mdi-eye-outline"
            size="small"
            variant="text"
            title="View profile"
            @click.stop="viewEmployee(item.code)"
          />
          <v-btn icon="mdi-pencil-outline" size="small" variant="text" disabled />
          <v-btn
            icon="mdi-delete-outline"
            size="small"
            variant="text"
            color="error"
            title="Delete"
            @click.stop="askDelete(item)"
          />
        </div>
      </template>

      <template #no-data>
        <div class="text-center text-medium-emphasis py-6">
          No employees match the current filters.
        </div>
      </template>
    </v-data-table>
  </v-card>

  <ConfirmDialog
    v-model="confirmOpen"
    title="Delete employee?"
    confirm-text="Delete"
    confirm-color="error"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  >
    <template v-if="deleteTarget">
      This will permanently remove <strong>{{ deleteTarget.fullName }}</strong>
      ({{ deleteTarget.code }}) from the directory. This action cannot be undone.
    </template>
  </ConfirmDialog>

  <EmployeeFormDialog v-model="createOpen" mode="create" />

  <v-btn
    class="create-fab"
    color="primary"
    size="large"
    elevation="6"
    prepend-icon="mdi-plus"
    @click="openCreate"
  >
    Create employee
  </v-btn>
</template>

<style scoped>
.create-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 100;
  border-radius: 999px;
}
</style>
