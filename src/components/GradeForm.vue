<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { addDocument } from '@/services/db-handler';

// Initialize Firebase Firestore
const db: Firestore = getFirestore();

// Form data for collection
const grade = ref({ studentCode: '', courseCode: '', value: null });

// Function to add document to Firestore
const addGrade = async () => {
  try {
    // Set custom code
    grade.value.code = grade.value.studentCode + '_' + grade.value.courseCode;

    // Add grade to Firestore
    await addDocument(db, 'grades', grade.value);

    // TODO: replace with a toast notification
    alert('Calificación agregada exitosamente!');

    // Reset form fields after submission
    grade.value = { studentCode: '', courseCode: '', value: null };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    alert(err);
  }
};
</script>

<template>
  <form @submit.prevent="addGrade">
    <input v-model="grade.studentCode" type="text" placeholder="Código de Estudiante " required />
    <input v-model="grade.courseCode" type="text" placeholder="Código de Asignatura" required />
    <input v-model="grade.value" type="number" placeholder="Calificación" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
