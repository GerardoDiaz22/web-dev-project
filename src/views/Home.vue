// <script setup lang="ts">
import { ref, computed } from 'vue'; 
import { useRouter } from 'vue-router';
import { localAuth } from '@/composables/useAuth'; 

const router = useRouter();
const { currentUser } = localAuth();

// Computada para obtener un nombre más amigable (prioriza displayName si existe)
const userName = computed(() => {
  if (!currentUser.value) return '';
  return currentUser.value.displayName || currentUser.value.email;
});

// Computada para determinar si mostrar el estado logueado
const isLoggedIn = computed(() => !!currentUser.value);

</script>

<template>
  <div class="flex justify-center items-start min-h-[calc(100vh-10rem)] pt-10 px-4">
    <div class="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 md:p-8 text-center">

      <div v-if="isLoggedIn">
        <svg class="w-12 h-12 text-primary-600 dark:text-primary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>

        <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido de Nuevo!
        </h2>
        <p class="text-xl text-primary-700 dark:text-primary-400 mb-5">
          {{ userName }}
        </p>
        <p class="text-gray-600 dark:text-gray-300 text-base md:text-lg">
          Nos alegra tenerte aquí. Puedes navegar por las diferentes secciones de la aplicación utilizando las opciones en el menú de navegación superior.
        </p>

      </div>

      <!-- Estado: Usuario No Logueado -->
      <div v-else>
         <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Bienvenido a la Plataforma
        </h2>
        <p class="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-6">
          Para acceder a todas las funcionalidades y comenzar a gestionar tus datos, por favor inicia sesión o crea una cuenta nueva.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
           <button
             @click="router.push('/login')"
             type="button"
             class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
           >
             Iniciar Sesión
           </button>
           <button
             @click="router.push('/register')"
             type="button"
             class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
           >
             Registrarse
           </button>
        </div>
      </div>

    </div> 
  </div>
</template>

<style scoped>

.min-h-\[calc\(100vh-10rem\)\] {
  min-height: calc(100vh - 10rem);
}
</style>