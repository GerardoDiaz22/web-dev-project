<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore, collection, doc, addDoc, getDoc } from 'firebase/firestore';

// Initialize Firebase Firestore
const db = getFirestore();

// Form data for collection
const student = ref({ id: '', name: '', age: null });

// Function to add document to Firestore
const addStudent = async () => {
  try {
    // Validate if entry already exists
    const studentRef = doc(db, 'students', student.value.id);
    const studentDoc = await getDoc(studentRef);

    if (studentDoc.exists()) {
      // TODO: replace with a modal dialog
      alert('Ya existe un estudiante con este ID.');
      return;
    }

    // Add student to Firestore
    await addDoc(collection(db, 'students'), student.value);

    // TODO: replace with a toast notification
    alert('Estudiante agregado exitosamente!');

    // Reset form fields after submission
    student.value = { id: '', name: '', age: null };
  } catch (err) {
    console.error(err);
    // TODO: replace with a modal dialog
    switch (err.code) {
      case 'permission-denied':
        alert('No tienes permiso para agregar estudiantes.');
        break;
      case 'unavailable':
        alert('El servicio no está disponible en este momento.');
        break;
      default:
        alert('Error al agregar estudiante. Inténtalo de nuevo más tarde.');
    }
  }
};
</script>

<template>
  <form @submit.prevent="addStudent">
    <input v-model="student.id" type="text" placeholder="ID" required />
    <input v-model="student.name" type="text" placeholder="Nombre" required />
    <input v-model="student.age" type="number" placeholder="Edad" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped></style>
