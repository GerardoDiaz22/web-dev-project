<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { addDocument } from '@/services/db-handler';

// Initialize Firebase Firestore
const db: Firestore = getFirestore();

// Form data for collection
const course = ref({ id: '', name: '', description: '' });

// Function to add document to Firestore
const addCourse = async () => {
  try {
    // Add course to Firestore
    await addDocument(db, 'courses', course.value);

    // TODO: replace with a toast notification
    alert('Asignatura agregado exitosamente!');

    // Reset form fields after submission
    course.value = { id: '', name: '', description: '' };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    alert(err);
  }
};
</script>

<template>
  <form @submit.prevent="addCourse">
    <input v-model="course.id" type="text" placeholder="ID" required />
    <input v-model="course.name" type="text" placeholder="Nombre" required />
    <input v-model="course.description" type="text" placeholder="Descripción" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
