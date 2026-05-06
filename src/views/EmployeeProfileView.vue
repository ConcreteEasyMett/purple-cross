<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '@/stores/employees'
import EmploymentStatusChip from '@/components/EmploymentStatusChip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmployeeFormDialog from '@/components/EmployeeFormDialog.vue'
import { useSnackbar } from '@/composables/useSnackbar'

const route = useRoute()
const router = useRouter()
const store = useEmployeesStore()
const snackbar = useSnackbar()
const { employees } = storeToRefs(store)

const code = computed(() => String(route.params.code ?? ''))
const employee = computed(() => employees.value.find((e) => e.code === code.value))

const confirmOpen = ref(false)
const editOpen = ref(false)

function openEdit() {
  editOpen.value = true
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' })
}

function backToList() {
  router.push({ name: 'employee-list' })
}

function askDelete() {
  confirmOpen.value = true
}

function confirmDelete() {
  const target = employee.value
  if (!target) return
  store.remove(target.code)
  snackbar.success(`Employee ${target.code} deleted`)
  confirmOpen.value = false
  router.push({ name: 'employee-list' })
}
</script>

<template>
  <template v-if="employee">
    <v-card>
      <v-card-item>
        <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 12px">
          <div>
            <v-card-title class="px-0 text-h6">{{ employee.fullName }}</v-card-title>
            <v-card-subtitle class="px-0 text-medium-emphasis">
              {{ employee.code }}
            </v-card-subtitle>
          </div>
          <div class="d-flex" style="gap: 8px">
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="backToList">Back</v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-pencil-outline" @click="openEdit">
              Edit
            </v-btn>
            <v-btn
              variant="tonal"
              color="error"
              prepend-icon="mdi-delete-outline"
              @click="askDelete"
            >
              Delete
            </v-btn>
          </div>
        </div>
      </v-card-item>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-overline text-medium-emphasis mb-2">Identity</div>
            <dl class="profile-grid">
              <dt>Code</dt>
              <dd>{{ employee.code }}</dd>
              <dt>Full Name</dt>
              <dd>{{ employee.fullName }}</dd>
            </dl>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-overline text-medium-emphasis mb-2">Employment</div>
            <dl class="profile-grid">
              <dt>Occupation</dt>
              <dd>{{ employee.occupation }}</dd>

              <dt>Department</dt>
              <dd>{{ employee.department }}</dd>

              <dt>Date of Employment</dt>
              <dd class="d-flex align-center" style="gap: 8px">
                <EmploymentStatusChip :date="employee.dateOfEmployment" kind="employment" />
                <span class="text-medium-emphasis">{{ formatDate(employee.dateOfEmployment) }}</span>
              </dd>

              <dt>Termination Date</dt>
              <dd class="d-flex align-center" style="gap: 8px">
                <EmploymentStatusChip :date="employee.terminationDate" kind="termination" />
                <span v-if="employee.terminationDate" class="text-medium-emphasis">
                  {{ formatDate(employee.terminationDate) }}
                </span>
              </dd>
            </dl>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete employee?"
      confirm-text="Delete"
      confirm-color="error"
      @confirm="confirmDelete"
    >
      This will permanently remove <strong>{{ employee.fullName }}</strong>
      ({{ employee.code }}) from the directory. This action cannot be undone.
    </ConfirmDialog>

    <EmployeeFormDialog v-model="editOpen" mode="edit" :initial="employee" />
  </template>

  <v-card v-else class="text-center pa-8">
    <v-icon icon="mdi-account-question-outline" size="48" color="medium-emphasis" />
    <div class="text-h6 mt-4">Employee not found</div>
    <div class="text-body-2 text-medium-emphasis mt-1">
      No employee with code <strong>{{ code }}</strong> exists in the directory.
    </div>
    <v-btn class="mt-6" color="primary" @click="backToList">Back to employees</v-btn>
  </v-card>
</template>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: minmax(140px, max-content) 1fr;
  row-gap: 12px;
  column-gap: 24px;
  margin: 0;
}
.profile-grid dt {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.8125rem;
  align-self: center;
}
.profile-grid dd {
  margin: 0;
  font-size: 0.9375rem;
}
</style>
