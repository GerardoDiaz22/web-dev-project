<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { localAuth } from '@/composables/local-auth';

const router = useRouter();
const { currentUser } = localAuth();
</script>

<template>
  <div>
    <h1>Hogar</h1>
    <p v-if="currentUser">Bienvenido, {{ currentUser.email }}</p>
    <p v-else>Por favor, inicia sesión o regístrate para continuar.</p>

  </div>
</template>

<style scoped></style>
