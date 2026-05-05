<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '@/stores/employees'
import EmploymentStatusChip from '@/components/EmploymentStatusChip.vue'
import { employmentStatus, terminationStatus } from '@/utils/employeeStatus'

const store = useEmployeesStore()
const { employees } = storeToRefs(store)

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

      <template #[`item.actions`]>
        <div class="d-flex justify-end" style="gap: 4px">
          <v-btn icon="mdi-eye-outline" size="small" variant="text" disabled />
          <v-btn icon="mdi-pencil-outline" size="small" variant="text" disabled />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" disabled />
        </div>
      </template>

      <template #no-data>
        <div class="text-center text-medium-emphasis py-6">
          No employees match the current filters.
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
