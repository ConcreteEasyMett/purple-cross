<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEmployeesStore } from '@/stores/employees'
import { useSnackbar } from '@/composables/useSnackbar'
import {
  parseEmployeesJson,
  previewMerge,
  mergeEmployees,
  type ParseResult,
} from '@/utils/employeeImport'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const store = useEmployeesStore()
const snackbar = useSnackbar()

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const result = ref<ParseResult | null>(null)
const error = ref('')
const mode = ref<'replace' | 'merge'>('merge')

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      fileName.value = ''
      result.value = null
      error.value = ''
      mode.value = 'merge'
    }
  },
)

function pickFile() {
  fileInput.value?.click()
}

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  fileName.value = file.name
  error.value = ''
  result.value = null
  try {
    const text = await file.text()
    result.value = parseEmployeesJson(text)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    target.value = ''
  }
}

const summary = computed(() => {
  if (!result.value) return ''
  const { valid, invalidCount } = result.value
  const skipped = invalidCount > 0 ? `, ${invalidCount} skipped (invalid)` : ''
  if (mode.value === 'replace') {
    return `Replace all ${store.employees.length} current records with ${valid.length} valid records from the file${skipped}.`
  }
  const { added, updated } = previewMerge(store.employees, valid)
  return `Merge by code: ${added} new, ${updated} updated${skipped}.`
})

const canApply = computed(
  () => !!result.value && result.value.valid.length > 0 && !error.value,
)

function close() {
  emit('update:modelValue', false)
}

function apply() {
  if (!result.value) return
  if (mode.value === 'replace') {
    store.replaceAll(result.value.valid)
  } else {
    store.replaceAll(mergeEmployees(store.employees, result.value.valid))
  }
  snackbar.success(`Imported ${result.value.valid.length} records`)
  close()
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">Import employees</v-card-title>
      <v-divider />
      <v-card-text>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="d-none"
          @change="onFileSelected"
        />

        <v-btn variant="tonal" prepend-icon="mdi-file-upload-outline" @click="pickFile">
          {{ fileName ? 'Choose another file' : 'Choose JSON file' }}
        </v-btn>

        <div v-if="fileName" class="mt-3 text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-file-document-outline" size="16" class="mr-1" />
          {{ fileName }}
        </div>

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-4">
          {{ error }}
        </v-alert>

        <template v-if="result && !error">
          <v-divider class="my-4" />
          <div class="text-overline text-medium-emphasis mb-2">Mode</div>
          <v-radio-group v-model="mode" hide-details density="compact">
            <v-radio value="merge" label="Merge by code (update existing, add new)" />
            <v-radio value="replace" label="Replace all current employees" />
          </v-radio-group>

          <div class="text-body-2 text-medium-emphasis mt-4">{{ summary }}</div>

          <v-alert
            v-if="result.valid.length === 0"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            No valid employees found in this file.
          </v-alert>
        </template>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn color="primary" :disabled="!canApply" @click="apply">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
