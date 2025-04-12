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
                placeholder="nombre@compania.com" required
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
            <div class="flex items-center justify-between">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800">
                </div>
                <div class="ml-3 text-sm">
                  <label for="remember" class="text-gray-500 dark:text-gray-300">Recuérdame</label>
                </div>
              </div>
            </div>
            <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Iniciar sesión
            </button>
            <div class="relative flex py-3 items-center">
              <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span class="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">O</span>
              <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <button @click="loginGoogle" type="button" class="w-full text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                <path fill-rule="evenodd" d="M8.842 18.083a8.8 M1.946 10.358a8.842 8.842 0 0116.142 0" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M17.98 8.987c0-.606-.055-1.191-.16-1.76h-8.84v3.327h4.97a4.22 4.22 0 01-1.832 2.759v2.169h2.79c1.636-1.505 2.577-3.68 2.577-6.186z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M8.98 18.083c2.42 0 4.454-.798 5.94-2.169l-2.79-2.169c-.8.536-1.832.85-2.94.85-2.268 0-4.184-1.53-4.868-3.576H1.19v2.255A8.841 8.841 0 008.98 18.083z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M4.112 10.358a5.297 5.297 0 010-3.63V4.473H1.19a8.841 8.841 0 000 8.115l2.922-2.23z" clip-rule="evenodd"/>
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
