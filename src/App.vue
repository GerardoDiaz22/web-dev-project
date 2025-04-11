<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import TheWelcome from './components/TheWelcome.vue';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

interface Student {
  id: string;
  name: string;
  age: number;
  email: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  grade: number;
}

const students: Student[] = collection(db, 'students');

const courses: Course[] = collection(db, 'courses');

const enrollments: Enrollment[] = collection(db, 'enrollments');

const grades: Grade[] = collection(db, 'grades');
</script>

<template>
  <h1>Dirección de Asuntos Estudiantiles</h1>
  <nav class="menu-bar">
    <RouterLink to="/">Inicio</RouterLink>
    <RouterLink to="/login">Ir al Login</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>

</style>
