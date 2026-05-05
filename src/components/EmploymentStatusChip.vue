<script setup lang="ts">
import { computed } from 'vue'
import { employmentStatus, terminationStatus } from '@/utils/employeeStatus'

const props = defineProps<{
  date: string | null
  kind: 'employment' | 'termination'
}>()

const status = computed(() =>
  props.kind === 'employment' ? employmentStatus(props.date) : terminationStatus(props.date),
)

const color = computed(() => {
  switch (status.value) {
    case 'Currently employed':
      return 'success'
    case 'Employed soon':
      return 'info'
    case 'Terminated':
      return 'secondary'
    case 'To be terminated':
      return 'warning'
    default:
      return undefined
  }
})

const formattedDate = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
})
</script>

<template>
  <span v-if="!status" class="text-medium-emphasis">—</span>
  <v-chip
    v-else
    :color="color"
    size="small"
    variant="tonal"
    label
    :title="formattedDate"
  >
    {{ status }}
  </v-chip>
</template>
