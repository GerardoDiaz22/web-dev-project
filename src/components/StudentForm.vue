<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { addDocument } from '@/services/db-handler';

// Initialize Firebase Firestore
const db: Firestore = getFirestore();

// Form data for collection
const student = ref({ code: '', name: '', age: null });

// Function to add document to Firestore
const addStudent = async () => {
  try {
    // Add student to Firestore
    await addDocument(db, 'students', student.value);

    // TODO: replace with a toast notification
    alert('Estudiante agregado exitosamente!');

    // Reset form fields after submission
    student.value = { code: '', name: '', age: null };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    alert(err);
  }
};
</script>

<template>
  <form @submit.prevent="addStudent">
    <input v-model="student.code" type="text" placeholder="Código" required />
    <input v-model="student.name" type="text" placeholder="Nombre" required />
    <input v-model="student.age" type="number" placeholder="Edad" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
