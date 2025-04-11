<script setup lang="ts">
import { ref } from 'vue';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

import StudentForm from '@/components/StudentForm.vue';

// Initialize Firebase Firestore
const db = getFirestore();

// Form data for each collection
const course = ref({ id: '', name: '', description: '' });
const enrollment = ref({ studentId: '', courseId: '' });
const grade = ref({ studentId: '', courseId: '', value: null });

// Functions to add documents to Firestore
const addCourse = async () => {
  try {
    await addDoc(collection(db, 'courses'), course.value);
    alert('Course added successfully!');

    // Reset form fields after submission
    course.value = { id: '', name: '', description: '' };
  } catch (error) {
    console.error('Error adding course:', error);
  }
};

const addEnrollment = async () => {
  try {
    await addDoc(collection(db, 'enrollments'), enrollment.value);
    alert('Enrollment added successfully!');

    // Reset form fields after submission
    enrollment.value = { studentId: '', courseId: '' };
  } catch (error) {
    console.error('Error adding enrollment:', error);
  }
};

const addGrade = async () => {
  try {
    await addDoc(collection(db, 'grades'), grade.value);
    alert('Grade added successfully!');

    // Reset form fields after submission
    grade.value = { studentId: '', courseId: '', grade: null };
  } catch (error) {
    console.error('Error adding grade:', error);
  }
};
</script>

<template>
  <h1>Playground</h1>

  <!-- Form for Students -->
  <h2>Agregar Estudiante</h2>
  <StudentForm />

  <!-- Form for Courses -->
  <h2>Agregar Asignatura</h2>
  <form @submit.prevent="addCourse">
    <input v-model="course.id" type="text" placeholder="ID" required />
    <input v-model="course.name" type="text" placeholder="Nombre" required />
    <input v-model="course.description" type="text" placeholder="Descripción" required />
    <button type="submit">Agregar</button>
  </form>

  <!-- Form for Enrollments -->
  <h2>Agregar Matrícula</h2>
  <form @submit.prevent="addEnrollment">
    <input v-model="enrollment.studentId" type="text" placeholder="Student ID" required />
    <input v-model="enrollment.courseId" type="text" placeholder="Course ID" required />
    <button type="submit">Agregar</button>
  </form>

  <!-- Form for Grades -->
  <h2>Agregar Calificación</h2>
  <form @submit.prevent="addGrade">
    <input v-model="grade.studentId" type="text" placeholder="Student ID" required />
    <input v-model="grade.courseId" type="text" placeholder="Course ID" required />
    <input v-model="grade.value" type="number" placeholder="Grade" required />
    <button type="submit">Agregar</button>
  </form>
</template>

<style scoped>
form {
  margin-bottom: 20px;
}
input {
  margin-right: 10px;
}
button {
  margin-top: 10px;
}
</style>
