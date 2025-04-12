<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { addDocument } from '@/services/db-handler';

// Initialize Firebase Firestore
const db: Firestore = getFirestore();

// Form data for collection
const enrollment = ref({ studentId: '', courseId: '' });

// Function to add document to Firestore
const addEnrollment = async () => {
  try {
    // Add course to Firestore
    await addDocument(db, 'enrollments', enrollment.value);

    // TODO: replace with a toast notification
    alert('Matricula agregada exitosamente!');

    // Reset form fields after submission
    enrollment.value = { studentId: '', courseId: '' };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    alert(err);
  }
};
</script>

<template>
  <form @submit.prevent="addEnrollment">
    <input v-model="enrollment.studentId" type="text" placeholder="ID de Estudiante" required />
    <input v-model="enrollment.courseId" type="text" placeholder="ID de Asignatura" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
