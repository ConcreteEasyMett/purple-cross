<script setup lang="ts"></script>

<template>
  <v-card class="text-center pa-8">
    <v-icon icon="mdi-compass-off-outline" size="48" color="medium-emphasis" />
    <div class="text-h6 mt-4">Page not found</div>
    <div class="text-body-2 text-medium-emphasis mt-1">
      The page you're looking for doesn't exist.
    </div>
    <v-btn class="mt-6" color="primary" to="/employees">Back to employees</v-btn>
  </v-card>
</template>
