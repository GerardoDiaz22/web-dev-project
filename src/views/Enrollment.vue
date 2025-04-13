<script setup>
import { ref, computed, onMounted,nextTick,  } from 'vue';
import { initFlowbite } from 'flowbite';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import GenericFormModal from '@/components/GenericFormModal.vue';
import { useToast } from 'vue-toastification';

//Tabla
const isLoading = ref(true); // Definir isLoading
const enrollments = ref([]);    // Definir enrollments donde cargarás los datos
const searchTerm = ref('');

const db = getFirestore(); 
const enrollmentsCollection = collection(db, 'enrollments'); 

// Modal
const showModal = ref(false);
const modalTitle = ref('');
const modalFields = ref([]);
const currentItem = ref(null); // Guarda el item a editar o null si es nuevo
const isEditMode = ref(false); // Para saber si estamos editando

const toast = useToast();


// Define la estructura de los campos para agregar Inscripcións en el modal
const enrollmentFields = [
  { key: 'studentId', label: 'Estudiante', type: 'text', required: true, placeholder: 'ID de Estudiante' },
  { key: 'courseId', label: 'Curso', type: 'text', required: true, placeholder: 'ID de Asignatura' },
];

const enrollmentEditFields = [
{ key: 'studentId', label: 'Estudiante', type: 'text', required: true, placeholder: 'ID de Estudiante' },
  { key: 'courseId', label: 'Curso', type: 'text', required: true, placeholder: 'ID de Asignatura' },
];

// Cargar enrollments desde Firestore
const fetchenrollment = async () => {
    isLoading.value = true;
    console.log("hiiiiiiiiiiiiiiii")
    try {
        const querySnapshot = await getDocs(enrollmentsCollection);
        enrollments.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("query snapshot",enrollments.value)
  


    } catch (error) {
        console.error("Error fetching enrollments: ", error);
    } finally {
        isLoading.value = false;
        await nextTick();
        initFlowbite();
    }
};

// Filtra los items basados en el término de búsqueda
const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return enrollments.value;
  }
  const lowerSearch = searchTerm.value.toLowerCase();
  return enrollments.value.filter(item =>
    Object.values(item).some(value => // Busca en todos los valores del objeto
      String(value).toLowerCase().includes(lowerSearch)
    )

  );
});



function mostrarItem(item) {
  console.log('Mostrar:', item);
  // Lógica para mostrar detalles
}


// carga de datos al montar
onMounted(() => {
  fetchenrollment(); 
  initFlowbite();

  
});


// --- Funciones para el Modal ---

const openAddModal = () => {
  isEditMode.value = false;
  modalTitle.value = 'Agregar Nuevo Inscripción';
  modalFields.value = enrollmentFields; // Usa la definición de campos
  currentItem.value = {}; // Limpia datos previos, el modal usará valores por defecto
  showModal.value = true;
};

const openEditModal = (enrollment) => {
  isEditMode.value = true;
  modalTitle.value = `Editar ${enrollment.name}`;
  modalFields.value = enrollmentEditFields; 
  // Pasa una copia de los datos para no modificar el original hasta guardar
  currentItem.value = { ...enrollment };
  showModal.value = true;
};

const handleFormSubmit = async (formData) => {
  isLoading.value = true; // Mostrar indicador mientras se guarda
  console.log("entro aqui")
  try {
    if (isEditMode.value && currentItem.value?.id) {
      // --- Modo Edición ---
      console.log("esto es current",currentItem.value.id)
      console.log("formdata",formData)
      const dataToUpdate = {
        id: toString(formData.id),
      name: formData.name, 

    };
      const enrollmentDocRef = doc(db, 'enrollments', toString(currentItem.value.id));
      console.log("esto es una prueba",enrollmentDocRef)
      await updateDoc(enrollmentDocRef, dataToUpdate); 

       console.log('enrollment actualizada:', currentItem.value.id);
       toast.success("Inscripción actualizada exitosamente!")

    } else {
      // --- Modo Creación ---
      console.log("esto es formdata",formData)
      const docRef = await addDoc(enrollmentsCollection, formData);
      // Añadir el nuevo item a la lista local con el ID devuelto
      enrollments.value.push({ id: docRef.id, ...formData });
      console.log('enrollment agregada con ID:', docRef.id);
      toast.success("Inscripción agregada exitosamente!")

    }
    showModal.value = false; // Cierra el modal (aunque el modal ya lo hace al emitir)
    currentItem.value = null; // Limpiar item actual


  } catch (error) {
    console.error("Error guardando enrollment: ", error);
    // Mostrar mensaje de error al usuario
  } finally {
     isLoading.value = false;
     // Asegurarse que Flowbite funcione después de actualizar la lista
     await nextTick();
     initFlowbite();
  }
};

// Función para eliminar (ejemplo básico)
const eliminarenrollment = async (enrollment) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar a ${enrollment.nombre}?`)) {
    return;
  }
  isLoading.value = true;
  try {
    const enrollmentDocRef = doc(db, 'enrollments', enrollment.id);
    await deleteDoc(enrollmentDocRef);
    // Eliminar de la lista local
    enrollments.value = enrollments.value.filter(p => p.id !== enrollment.id);
    console.log('enrollment eliminada:', enrollment.id);
    toast.success("Inscripción eliminado exitosamente!")

  } catch (error) {
     console.error("Error eliminando enrollment: ", error);
     // Mostrar mensaje de error
  } finally {
      isLoading.value = false;
      // Reinit Flowbite
      await nextTick();
      initFlowbite();
  }
};

</script>

<template>
  
<section class="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
  
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
      <h2 class="text-4x1 font-semibold text-gray-900 dark:text-white mb-4">
            Listado de Inscripciones
        </h2>
        <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div class="w-full md:w-1/2">
                    <form class="flex items-center">
                        <label for="simple-search" class="sr-only">Buscar</label>
                        <div class="relative w-full">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <!-- v-model conecta el input con la variable reactiva searchTerm -->
                            <input
                                type="text"
                                id="simple-search"
                                v-model="searchTerm"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Buscar Inscripción..."
                            >
                        </div>
                    </form>
                </div>
                <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <!-- @click dispara la función agregarInscripción -->
                    <button
                    type="button"
                    @click="openAddModal"
                    class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                    >
                    <svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                    Agregar inscripción
                    </button>

                    <!-- <div class="flex items-center space-x-3 w-full md:w-auto">
                        <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2 text-gray-400" viewbox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                            </svg>
                            Filtrar
                            <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </button>
                        <div id="filterDropdown" class="z-10 hidden w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                            <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Filtrar por Curso</h6>
                            <ul class="space-y-2 text-sm" aria-labelledby="filterDropdownButton">
                                <li class="flex items-center">
                                    <input id="vue-filter" type="checkbox" value="Vue Avanzado" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                    <label for="vue-filter" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Vue Avanzado</label>
                                </li>
                                <li class="flex items-center">
                                    <input id="react-filter" type="checkbox" value="React Básico" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                    <label for="react-filter" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">React Básico</label>
                                </li>
                            </ul>
                        </div>
                    </div> -->
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-4 py-3">Cod. Estudiante</th> 
                            <th scope="col" class="px-4 py-3">Cod. Asignatura</th> 

                            <th scope="col" class="px-4 py-3">
                                <span class="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                   
                        <tr
                          v-for="item in filteredItems"
                          :key="item.id"
                          class="border-b dark:border-gray-700"
                        >
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ item.studentId }}</th>
                            <td class="px-4 py-3">{{ item.courseId }}</td>

                            <td class="px-4 py-3 flex items-center justify-end">
                     
                                <button
                                  :id="`action-dropdown-button-${item.id}`"
                                  :data-dropdown-toggle="`action-dropdown-${item.id}`"
                                  class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                  type="button"
                                >
                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>
                                <div
                                  :id="`action-dropdown-${item.id}`"
                                  class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600"
                                >
                                    <ul class="py-4 text-sm text-gray-700 dark:text-gray-200" :aria-labelledby="`action-dropdown-button-${item.id}`">
                                        <li>
                                            <!-- Usamos @click para llamar a los métodos pasando el item actual -->
                                            <a href="#" @click.prevent="mostrarItem(item)" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mostrar</a>
                                        </li>
                                        <li>
                                            <a href="#" @click.prevent="openEditModal(item)" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Editar</a>
                                        </li>
                                    </ul>
                                    <div class="py-1">
                                        <a href="#" @click.prevent="eliminarenrollment(item)" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Eliminar</a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                         <!-- Mensaje si no hay resultados -->
                         <tr v-if="filteredItems.length === 0">
                            <td colspan="6" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                No se encontraron Inscripcións.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Paginación (Simplificada - necesitaría más lógica para ser funcional) -->
            <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Mostrando
                    <!-- Estos valores deberían ser dinámicos basados en la paginación real -->
                    <span class="font-semibold text-gray-900 dark:text-white">1-{{ filteredItems.length > 10 ? 10 : filteredItems.length }}</span>
                    de
                    <span class="font-semibold text-gray-900 dark:text-white">{{ filteredItems.length }}</span>
                     <!-- (Implementar paginación completa requeriría más estado y lógica) -->
                </span>
                <ul class="inline-flex items-stretch -space-x-px">
                    <!-- Lógica de paginación iría aquí -->
                    <li>
                        <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <span class="sr-only">Anterior</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                    </li>
                    <!-- ... más números de página ... -->
                    <li>
                        <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <span class="sr-only">Siguiente</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</section>

  <!-- Instancia del Modal Genérico -->
  <GenericFormModal
    v-model="showModal"
    :title="modalTitle"
    :fields="modalFields"
    :initial-data="currentItem"
    @submit="handleFormSubmit"
    :submit-button-text="isEditMode ? 'Actualizar' : 'Crear Inscripción'"
  />

</template>