<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const email = ref('');
const password = ref('');
const errMsg = ref('');

const signIn = async () => {
  try {
    const data = await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (err) {
    console.error(err);
    switch (err.code) {
      case 'auth/invalid-email':
        errMsg.value = 'Correo electrónico inválido';
        break;
      case 'auth/weak-password':
        errMsg.value = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/email-already-in-use':
        errMsg.value = 'El correo electrónico ya está en uso';
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

const signInGoogle = async () => {
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
  <h1>Registrar tu cuenta</h1>
  <p><input type="text" placeholder="Correo" v-model="email" /></p>
  <p><input type="password" placeholder="Contraseña" v-model="password" /></p>
  <p v-if="errMsg">{{ errMsg }}</p>
  <p><button @click="signIn">Registrarse</button></p>
  <p><button @click="signInGoogle">Registrarse con Google</button></p>
  <p>Ya tienes cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink></p>
</template>

<style scoped></style>
