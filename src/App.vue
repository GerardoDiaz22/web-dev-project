<script setup lang="ts">
import { computed } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { localAuth } from '@/composables/useAuth';
import NavBar from './components/NavBar.vue';

const route = useRoute();

const showNavbar = computed(() => {
  const hiddenRoutes = ['/login', '/register'];
  return !hiddenRoutes.includes(route.path);
});

</script>

<template>
    <div class="max-w-8xl mx-auto">
      <NavBar v-if="showNavbar" />
      <RouterView />
    </div>
</template>

<style scoped></style>