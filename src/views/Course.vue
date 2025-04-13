<script setup>
import { ref, computed, onMounted,nextTick,  } from 'vue';
import { initFlowbite } from 'flowbite';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import GenericFormModal from '@/components/GenericFormModal.vue';
import { useToast } from 'vue-toastification';
import { generateExcelReport } from '@/utils/excelExporter'; 

//Tabla
const isLoading = ref(true); // Definir isLoading
const courses = ref([]);    // Definir courses donde cargarás los datos
const searchTerm = ref('');

const db = getFirestore(); 
const coursesCollection = collection(db, 'courses'); 

// Modal
const showModal = ref(false);
const modalTitle = ref('');
const modalFields = ref([]);
const currentItem = ref(null); // Guarda el item a editar o null si es nuevo
const isEditMode = ref(false); // Para saber si estamos editando

const toast = useToast();

// Define la estructura de los campos para agregar cursos en el modal
const courseFields = [
{ key: 'id', label: 'id', type: 'text', required: true, placeholder: 'Ej: 25' },
  { key: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre' },
  { key: 'description', label: 'Descripción', type: 'text', required: true, placeholder: 'Descripción' },
];

const courseEditFields = [
{ key: 'id', label: 'id', type: 'text', required: true, placeholder: 'Ej: 25' },
  { key: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre' },
  { key: 'description', label: 'Descripción', type: 'text', required: true, placeholder: 'Descripción' },
];

// Cargar courses desde Firestore
const fetchcourse = async () => {
    isLoading.value = true;
    console.log("hiiiiiiiiiiiiiiii")
    try {
        const querySnapshot = await getDocs(coursesCollection);
        courses.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("query snapshot",courses.value)
  


    } catch (error) {
        console.error("Error fetching courses: ", error);
    } finally {
        isLoading.value = false;
        await nextTick();
        initFlowbite();
    }
};

// Filtra los items basados en el término de búsqueda
const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return courses.value;
  }
  const lowerSearch = searchTerm.value.toLowerCase();
  return courses.value.filter(item =>
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
  fetchcourse(); 
  initFlowbite();

  
});


// --- Funciones para el Modal ---

const openAddModal = () => {
  isEditMode.value = false;
  modalTitle.value = 'Agregar Nuevo curso';
  modalFields.value = courseFields; // Usa la definición de campos
  currentItem.value = {}; // Limpia datos previos, el modal usará valores por defecto
  showModal.value = true;
};

const openEditModal = (course) => {
  isEditMode.value = true;
  modalTitle.value = `Editar ${course.name}`;
  modalFields.value = courseEditFields; 
  // Pasa una copia de los datos para no modificar el original hasta guardar
  currentItem.value = { ...course };
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
      const courseDocRef = doc(db, 'courses', toString(currentItem.value.id));
      console.log("esto es una prueba",courseDocRef)
      await updateDoc(courseDocRef, dataToUpdate); 

       console.log('course actualizada:', currentItem.value.id);
       toast.success("Curso actualizado exitosamente!")

    } else {
      // --- Modo Creación ---
      console.log("esto es formdata",formData)
      const docRef = await addDoc(coursesCollection, formData);
      // Añadir el nuevo item a la lista local con el ID devuelto
      courses.value.push({ id: docRef.id, ...formData });
      console.log('course agregada con ID:', docRef.id);
      toast.success("Curso agregado exitosamente!")

    }
    showModal.value = false; // Cierra el modal (aunque el modal ya lo hace al emitir)
    currentItem.value = null; // Limpiar item actual


  } catch (error) {
    console.error("Error guardando course: ", error);
    // Mostrar mensaje de error al usuario
  } finally {
     isLoading.value = false;
     // Asegurarse que Flowbite funcione después de actualizar la lista
     await nextTick();
     initFlowbite();
  }
};

// Función para eliminar (ejemplo básico)
const eliminarcourse = async (course) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar a ${course.nombre}?`)) {
    return;
  }
  isLoading.value = true;
  try {
    const courseDocRef = doc(db, 'courses', course.id);
    await deleteDoc(courseDocRef);
    // Eliminar de la lista local
    courses.value = courses.value.filter(p => p.id !== course.id);
    console.log('course eliminada:', course.id);
    toast.success("Curso eliminado exitosamente!")
  } catch (error) {
     console.error("Error eliminando course: ", error);
     // Mostrar mensaje de error
  } finally {
      isLoading.value = false;
      // Reinit Flowbite
      await nextTick();
      initFlowbite();
  }
};


//Función para Exportar a Excel
const exportToExcel = () => {
  const dataToExport = filteredItems.value;

  const columnMapping = {
    'ID':'id',
    'Curso': 'name',
    'Descripción': 'description',
  };

  // Llama a la función reutilizable
  const success = generateExcelReport(
      dataToExport,
      columnMapping,
      'reporte_cursos', // Nombre base del archivo
      'Cursos'          // Nombre de la hoja
   );

  if (success) {
      toast.success("Reporte Excel generado exitosamente!");
  } else {
      toast.error("No se pudo generar el reporte (verifique si hay datos).");
  }
};



// --- Añadir Estado para Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(10); // Puedes ajustar este valor

// --- Calcular Total de Páginas ---
const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value);
});

// --- Calcular Items de la Página Actual ---
const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredItems.value.slice(startIndex, endIndex);
});

// --- Calcular Rango de Items Mostrados ---
const displayRange = computed(() => {
    const totalFiltered = filteredItems.value.length;
    if (totalFiltered === 0) {
        return '0';
    }
    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = Math.min(currentPage.value * itemsPerPage.value, totalFiltered);
    return `${start}-${end}`;
});

// --- Funciones de Navegación ---
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

</script>

<template>
  
<section class="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
  
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
      <h2 class="text-4x1 font-semibold text-gray-900 dark:text-white mb-4">
            Listado de cursos
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
                                placeholder="Buscar curso..."
                            >
                        </div>
                    </form>
                </div>
                <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <!-- @click dispara la función agregarcurso -->
                    <button
                    type="button"
                    @click="openAddModal"
                    class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                    >
                    <svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                    Agregar curso
                    </button>

                    <div class="flex items-center space-x-3 w-full md:w-auto">
                      <button
                        type="button"
                        @click="exportToExcel"
                        class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 mr-2">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Generar reporte
                    </button>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-4 py-3">ID</th>
                            <th scope="col" class="px-4 py-3">Nombre</th> 
                            <th scope="col" class="px-4 py-3">Descripción</th> 

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
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ item.id }}</th>
                            <td class="px-4 py-3">{{ item.name }}</td>
                            <td class="px-4 py-3">{{ item.description }}</td>

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
                                        <a href="#" @click.prevent="eliminarcourse(item)" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Eliminar</a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                         <!-- Mensaje si no hay resultados -->
                         <tr v-if="filteredItems.length === 0">
                            <td colspan="6" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                No se encontraron cursos.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <nav v-if="!isLoading && filteredItems.length > 0" class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Mostrando
                    <span class="font-semibold text-gray-900 dark:text-white">{{ displayRange }}</span>
                    de
                    <span class="font-semibold text-gray-900 dark:text-white">{{ filteredItems.length }}</span>
                </span>
                <ul class="inline-flex items-stretch -space-x-px">
                    <!-- Botón Anterior -->
                    <li>
                        <button
                            @click="prevPage"
                            :disabled="currentPage === 1"
                            class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span class="sr-only">Anterior</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        </button>
                    </li>
                    <!-- Indicador de Página Actual (simple) -->
                     <li>
                        <span class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                           Página {{ currentPage }} de {{ totalPages }}
                        </span>
                    </li>
                    <!-- Botón Siguiente -->
                    <li>
                         <button
                            @click="nextPage"
                            :disabled="currentPage >= totalPages"
                            class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span class="sr-only">Siguiente</span>
                            <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
                        </button>
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
    :submit-button-text="isEditMode ? 'Actualizar' : 'Crear curso'"
  />

</template>