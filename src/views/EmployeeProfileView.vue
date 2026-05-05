<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const code = route.params.code as string
</script>

<template>
  <v-card>
    <v-card-title class="text-h6">Employee {{ code }}</v-card-title>
    <v-card-text class="text-medium-emphasis">
      The employee profile will land in Phase 5.
    </v-card-text>
  </v-card>
</template>
