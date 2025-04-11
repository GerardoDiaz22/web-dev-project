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
  <h1>Iniciar sesión</h1>
  <p><input type="text" placeholder="Correo" v-model="email" /></p>
  <p><input type="password" placeholder="Contraseña" v-model="password" /></p>
  <p v-if="errMsg">{{ errMsg }}</p>
  <p><button @click="login">Iniciar sesión</button></p>
  <p><button @click="loginGoogle">Iniciar sesión con Google</button></p>
  <p>No tienes cuenta? <RouterLink to="/register">Registrarse</RouterLink></p>
</template>

<style scoped></style>
