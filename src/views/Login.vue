<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const email = ref('');
const password = ref('');
const errMsg = ref('');

const login = async () => {
  try {
    const data = await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (err) {
    console.error(err);
    switch (err.code) {
      case 'auth/invalid-email':
        errMsg.value = 'Correo electrónico inválido';
        break;
      case 'auth/user-not-found':
        errMsg.value = 'Usuario no encontrado';
        break;
      case 'auth/invalid-credential':
        errMsg.value = 'Credenciales inválidas';
        break;
      case 'auth/missing-password':
        errMsg.value = 'Falta la contraseña';
        break;
      default:
        errMsg.value = 'Error desconocido. Intenta de nuevo más tarde.';
        break;
    }
  }
};

const loginGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const data = await signInWithPopup(auth, provider);
    router.push('/');
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">

    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0">
      
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Inicia sesión en tu cuenta
          </h1>
          <p v-if="errMsg" class="text-sm font-medium text-red-600 dark:text-red-500">
            {{ errMsg }}
          </p>
          <form class="space-y-4 md:space-y-6" @submit.prevent="login">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tu correo</label>
              <input
                type="email" name="email" id="email" v-model="email"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="nombre@email.com" required
              >
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
              <input
                type="password" name="password" id="password" v-model="password" placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              >
            </div>
    
            <button type="submit" class="w-full  text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              Iniciar sesión
            </button>
            <div class="relative flex py-3 items-center">
              <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span class="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">O</span>
              <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <button @click="loginGoogle" type="button" class="w-full  text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              <path fill="none" d="M1 1h22v22H1z"/> 
            </svg>
              Iniciar sesión con Google
            </button>
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              ¿No tienes una cuenta todavía?
              <RouterLink to="/register" class="font-medium text-primary-600 hover:underline dark:text-primary-500">
                Regístrate
              </RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
