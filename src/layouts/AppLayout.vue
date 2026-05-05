<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'

const route = useRoute()
const { state: snackbar } = useSnackbar()

type Crumb = { title: string; to?: string; disabled?: boolean }

const crumbs = computed<Crumb[]>(() => {
  const base: Crumb = { title: 'Employees', to: '/employees' }
  switch (route.name) {
    case 'employee-list':
      return [{ ...base, disabled: true }]
    case 'employee-profile':
      return [base, { title: String(route.params.code ?? ''), disabled: true }]
    case 'not-found':
      return [{ title: 'Not found', disabled: true }]
    default:
      return [{ ...base, disabled: true }]
  }
})
</script>

<template>
  <v-app-bar color="surface" border="b">
    <div class="d-flex align-center px-4" style="gap: 12px">
      <v-icon icon="mdi-plus-thick" color="primary" size="22" />
      <span class="text-subtitle-1 font-weight-bold">Purple Cross</span>
      <v-divider vertical class="mx-2" />
      <span class="text-body-2 text-medium-emphasis">Employee Management</span>
    </div>

    <v-spacer />

    <v-avatar color="surface-variant" size="32" class="mr-4">
      <span class="text-caption font-weight-medium">PC</span>
    </v-avatar>
  </v-app-bar>

  <v-main class="bg-background">
    <v-container fluid class="pa-6" style="max-width: 1400px">
      <v-breadcrumbs :items="crumbs" density="compact" class="px-0 pt-0 pb-4 text-medium-emphasis" />
      <router-view />
    </v-container>
  </v-main>

  <v-snackbar
    v-model="snackbar.visible"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="bottom right"
  >
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" @click="snackbar.visible = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>
