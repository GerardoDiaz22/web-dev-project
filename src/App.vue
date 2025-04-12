<script setup lang="ts">
import { computed } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { localAuth } from '@/composables/local-auth';
import NavBar from './components/NavBar.vue';

const router = useRouter();
const route = useRoute();
const auth = getAuth();
const { currentUser } = localAuth();

const showNavbar = computed(() => {
  const hiddenRoutes = ['/login', '/register'];
  return !hiddenRoutes.includes(route.path);
});

const logout = async () => {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

</script>

<template>
    <div class="max-w-8xl mx-auto">
      <NavBar v-if="showNavbar" />
      <RouterView />
    </div>
</template>

<style scoped></style>