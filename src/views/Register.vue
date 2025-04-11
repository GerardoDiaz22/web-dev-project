<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const email = ref('');
const password = ref('');
const errMsg = ref('');

const register = async () => {
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
</script>

<template>
  <h1>Registrar tu cuenta</h1>
  <p><input type="text" placeholder="Correo" v-model="email" /></p>
  <p><input type="password" placeholder="Contraseña" v-model="password" /></p>
  <p v-if="errMsg">{{ errMsg }}</p>
  <p><button @click="register">Registrarse</button></p>
  <p>Ya tienes cuenta? <RouterLink to="/login">Iniciar sesión</RouterLink></p>
</template>

<style scoped></style>
