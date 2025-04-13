<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { addDocument } from '@/services/db-handler';

// Initialize Firebase Firestore
const db: Firestore = getFirestore();

// Form data for collection
const course = ref({ code: '', name: '' });

// Function to add document to Firestore
const addCourse = async () => {
  try {
    // Add course to Firestore
    await addDocument(db, 'courses', course.value);

    // TODO: replace with a toast notification
    alert('Asignatura agregado exitosamente!');

    // Reset form fields after submission
    course.value = { code: '', name: '' };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    alert(err);
  }
};
</script>

<template>
  <form @submit.prevent="addCourse">
    <input v-model="course.code" type="text" placeholder="Código" required />
    <input v-model="course.name" type="text" placeholder="Nombre" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
