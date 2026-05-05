<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '@/stores/employees'
import EmploymentStatusChip from '@/components/EmploymentStatusChip.vue'

const store = useEmployeesStore()
const { employees } = storeToRefs(store)

const headers = [
  { title: 'Code', key: 'code', sortable: true, width: 110 },
  { title: 'Full Name', key: 'fullName', sortable: true },
  { title: 'Occupation', key: 'occupation', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Date of Employment', key: 'dateOfEmployment', sortable: true },
  { title: 'Termination Date', key: 'terminationDate', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const, width: 160 },
]

const total = computed(() => employees.value.length)
</script>

<template>
  <v-card>
    <v-card-item>
      <div class="d-flex align-center justify-space-between">
        <div>
          <v-card-title class="px-0 text-h6">Employees</v-card-title>
          <v-card-subtitle class="px-0 text-medium-emphasis">
            {{ total }} {{ total === 1 ? 'record' : 'records' }} on file
          </v-card-subtitle>
        </div>
      </div>
    </v-card-item>

    <v-divider />

    <v-data-table
      :headers="headers"
      :items="employees"
      item-value="code"
      :items-per-page="25"
      :items-per-page-options="[10, 25, 50, 100]"
      density="comfortable"
      hover
    >
      <template #item.dateOfEmployment="{ item }">
        <EmploymentStatusChip :date="item.dateOfEmployment" kind="employment" />
      </template>

      <template #item.terminationDate="{ item }">
        <EmploymentStatusChip :date="item.terminationDate" kind="termination" />
      </template>

      <template #item.actions>
        <div class="d-flex justify-end" style="gap: 4px">
          <v-btn icon="mdi-eye-outline" size="small" variant="text" disabled />
          <v-btn icon="mdi-pencil-outline" size="small" variant="text" disabled />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" disabled />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>
