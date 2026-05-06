<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useEmployeesStore } from '@/stores/employees'
import { useSnackbar } from '@/composables/useSnackbar'
import type { Employee } from '@/types/employee'

type Mode = 'create' | 'edit'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    mode: Mode
    initial?: Employee | null
  }>(),
  { initial: null },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', employee: Employee): void
}>()

const store = useEmployeesStore()
const snackbar = useSnackbar()

const formRef = ref()
const formValid = ref(false)

function emptyDraft(): Employee {
  return {
    code: '',
    fullName: '',
    occupation: '',
    department: '',
    dateOfEmployment: null,
    terminationDate: null,
  }
}

const draft = reactive<Employee>(emptyDraft())

const isEdit = computed(() => props.mode === 'edit')
const title = computed(() => (isEdit.value ? 'Edit employee' : 'Create employee'))

watch(
  () => [props.modelValue, props.initial?.code, props.mode],
  () => {
    if (!props.modelValue) return
    if (isEdit.value && props.initial) {
      Object.assign(draft, props.initial)
    } else {
      Object.assign(draft, emptyDraft())
    }
    formRef.value?.resetValidation?.()
  },
  { immediate: true },
)

const codeRules = computed(() => [
  (v: string | null) => (!!v && v.trim().length > 0) || 'Code is required',
  (v: string) => /^EMP\d{3,}$/.test(v) || 'Use format EMP followed by at least 3 digits',
  (v: string) => {
    if (isEdit.value) return true
    return store.employees.every((e) => e.code !== v) || 'This code already exists'
  },
])

const fullNameRules = [
  (v: string | null) => (!!v && v.trim().length > 0) || 'Full name is required',
  (v: string) => v.trim().length >= 2 || 'Full name must be at least 2 characters',
  (v: string) =>
    /^[A-Za-z .'-]+$/.test(v.trim()) ||
    'Use letters, spaces, periods, apostrophes, or hyphens only',
]

const occupationRules = [
  (v: string | null) => (!!v && v.trim().length > 0) || 'Occupation is required',
]

const departmentRules = [
  (v: string | null) => (!!v && v.trim().length > 0) || 'Department is required',
]

const terminationRules = computed(() => [
  (v: string | null) => {
    if (!v) return true
    if (!draft.dateOfEmployment) return true
    return (
      new Date(v).getTime() >= new Date(draft.dateOfEmployment).getTime() ||
      'Termination must be on or after the employment date'
    )
  },
])

async function save() {
  const result = await formRef.value?.validate?.()
  if (result && result.valid === false) return

  const employee: Employee = {
    code: draft.code.trim(),
    fullName: draft.fullName.trim(),
    occupation: (draft.occupation ?? '').trim(),
    department: (draft.department ?? '').trim(),
    dateOfEmployment: draft.dateOfEmployment || null,
    terminationDate: draft.terminationDate || null,
  }

  if (isEdit.value) {
    store.update(employee.code, employee)
    snackbar.success(`Employee ${employee.code} updated`)
  } else {
    store.add(employee)
    snackbar.success(`Employee ${employee.code} created`)
  }

  emit('saved', employee)
  emit('update:modelValue', false)
}

function cancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    persistent
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-divider />
      <v-card-text>
        <v-form ref="formRef" v-model="formValid" validate-on="blur" @submit.prevent="save">
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="draft.code"
                :rules="codeRules"
                label="Code"
                placeholder="EMP051"
                :disabled="isEdit"
                required
              />
            </v-col>
            <v-col cols="12" sm="8">
              <v-text-field
                v-model="draft.fullName"
                :rules="fullNameRules"
                label="Full Name"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-combobox
                v-model="draft.occupation"
                :items="store.occupations"
                :rules="occupationRules"
                label="Occupation"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox
                v-model="draft.department"
                :items="store.departments"
                :rules="departmentRules"
                label="Department"
                required
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.dateOfEmployment"
                type="date"
                label="Date of Employment"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="draft.terminationDate"
                type="date"
                label="Termination Date"
                :rules="terminationRules"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" :disabled="!formValid" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
