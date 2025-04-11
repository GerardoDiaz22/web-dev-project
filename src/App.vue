<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { localAuth } from '@/composables/local-auth';
import NavBar from './components/NavBar.vue';
const router = useRouter();
const auth = getAuth();
const { currentUser } = localAuth();

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
  <!-- <h1>Dirección de Asuntos Estudiantiles</h1>
  <nav class="menu-bar">
    <RouterLink to="/">Inicio</RouterLink>
    <RouterLink v-if="!currentUser" to="/login">Iniciar sesión</RouterLink>
    <RouterLink v-if="!currentUser" to="/register">Registrarse</RouterLink>
    <button @click="logout" v-if="currentUser">Cerrar sesión</button>
  </nav> -->
  <!-- <main> -->
    <div class="max-w-8xl mx-auto">
      <NavBar/>

<RouterView />
</div>
<main>
    <h1>Dirección de Asuntos Estudiantiles</h1>
  <nav class="menu-bar">
    <RouterLink to="/">Inicio</RouterLink>
    <RouterLink v-if="!currentUser" to="/login">Iniciar sesión</RouterLink>
    <RouterLink v-if="!currentUser" to="/register">Registrarse</RouterLink>
    <button @click="logout" v-if="currentUser">Cerrar sesión</button>
  </nav> 
</main>

    
  <!-- </main> -->
</template>

<style scoped></style>
