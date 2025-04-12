<script setup lang="ts">
import { ref } from 'vue';
import { Firestore } from 'firebase/firestore';

import StudentForm from '@/components/StudentForm.vue';
import CourseForm from '@/components/CourseForm.vue';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import GradeForm from '@/components/GradeForm.vue';
</script>

<template>
  <h1>Playground</h1>

  <!-- Form for Students -->
  <h2>Agregar Estudiante</h2>
  <StudentForm />

  <!-- Form for Courses -->
  <h2>Agregar Asignatura</h2>
  <CourseForm />

  <!-- Form for Enrollments -->
  <h2>Agregar Matrícula</h2>
  <EnrollmentForm />

  <!-- Form for Grades -->
  <h2>Agregar Calificación</h2>
  <GradeForm />
</template>

<style scoped></style>
