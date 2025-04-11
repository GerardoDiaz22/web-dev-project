<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Importar hooks de Vue Router
// import axios from 'axios'; // O usar fetch directamente

// Asume que estos componentes NO dependen de Inertia internamente
// import MagnifyingGlass from '@/Components/Icons/MagnifyingGlass.vue'; // Asegúrate que la ruta es correcta
// import Pagination from '@/Components/Pagination.vue'; // Adaptaremos este componente o su uso

// --- Tipos (opcional pero recomendado) ---
interface Student {
    id: number;
    name: string;
    email: string;
    class: { id: number; name: string };
    section: { id: number; name: string };
    created_at_formatted: string; // O un tipo Date si prefieres formatear en el frontend
}

interface ClassInfo {
    id: number;
    name: string;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    // Agrega otros campos si tu API los devuelve (ej: per_page)
}

interface ApiResponse<T> {
    data: T[];
    meta: PaginationMeta; // Asume que tu API devuelve metadatos de paginación
    // links: any; // Podrías necesitar links si tu componente Pagination los usa
}

// --- Router y Ruta ---
const route = useRoute();
const router = useRouter();

// --- Estado Local ---
const students = ref<Student[]>([]); // Lista de estudiantes de la página actual
const classes = ref<ClassInfo[]>([]);   // Lista de todas las clases para el filtro
const paginationMeta = ref<PaginationMeta | null>(null); // Metadatos de paginación
const isLoading = ref(false);
const fetchError = ref<string | null>(null);

// Inicializar filtros/página desde los query params de la URL
const searchTerm = ref(route.query.search?.toString() ?? '');
const class_id = ref(route.query.class_id?.toString() ?? '');
const currentPage = ref(parseInt(route.query.page?.toString() ?? '1'));

// --- API Calls ---

// Función para construir la URL de la API con parámetros
const buildApiUrl = () => {
    // **IMPORTANTE:** Reemplaza '/api/students' con tu endpoint real
    const url = new URL('/api/students', window.location.origin);
    url.searchParams.set('page', currentPage.value.toString());

    if (searchTerm.value) {
        url.searchParams.set('search', searchTerm.value);
    }
    if (class_id.value) {
        url.searchParams.set('class_id', class_id.value);
    }
    return url.toString();
};

// Función para obtener los estudiantes
const fetchStudents = async () => {
    // isLoading.value = true;
    // fetchError.value = null;
    // const apiUrl = buildApiUrl();
    // console.log("Fetching students from:", apiUrl); // Para depuración

    // try {
    //     const response = await fetch(apiUrl, {
    //         headers: {
    //             'Accept': 'application/json', // Importante para que el backend sepa devolver JSON
    //             // Añade otros headers si son necesarios (ej: Authorization)
    //         }
    //     });
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const result = await response.json() as ApiResponse<Student>; // Castear la respuesta
    //     students.value = result.data;
    //     paginationMeta.value = result.meta; // Guardar metadatos para el componente Pagination
    //     console.log("Students data received:", result); // Para depuración
    // } catch (error: any) {
    //     console.error('Failed to fetch students:', error);
    //     fetchError.value = `Failed to load students: ${error.message}`;
    //     students.value = []; // Limpiar en caso de error
    //     paginationMeta.value = null;
    // } finally {
    //     isLoading.value = false;
    // }
    students.value = [{
        id:1,
        name:"Jose",
        email:"josxo665@gmail.com",
        class:{id:1,name:"xd"},
        section:{id:1,name:"hola"},
        created_at_formatted:"fecha"

    }]


};

// Función para obtener las clases (solo se necesita una vez)
const fetchClasses = async () => {
    try {
        // **IMPORTANTE:** Reemplaza '/api/classes' con tu endpoint real
        const response = await fetch('/api/classes', {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Asume que la API de clases devuelve un array simple o un objeto con una propiedad 'data'
        const result = await response.json();
        classes.value = Array.isArray(result) ? result : (result.data || []);
    } catch (error) {
        console.error('Failed to fetch classes:', error);
        // Podrías mostrar un error o dejar el selector vacío
    }
};

// Función para eliminar un estudiante
const deleteStudent = async (id: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
        isLoading.value = true; // O un loading específico para la fila
        try {
            // **IMPORTANTE:** Reemplaza '/api/students/' con tu endpoint real
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    // Añade otros headers si son necesarios (ej: CSRF Token, Authorization)
                }
            });
            if (!response.ok) {
                // Intenta obtener un mensaje de error del backend si es posible
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(`Failed to delete: ${errorData.message || response.statusText}`);
            }
            // Éxito: Refrescar la lista de estudiantes en la página actual
            await fetchStudents();
            // Opcional: Mostrar notificación de éxito
        } catch (error: any) {
            console.error('Failed to delete student:', error);
            alert(`Error deleting student: ${error.message}`); // Informar al usuario
        } finally {
            isLoading.value = false;
        }
    }
};


// --- Watchers para reaccionar a cambios y actualizar URL/fetch data ---

// Observa los filtros y la página para actualizar la URL y volver a cargar datos
watch([searchTerm, class_id, currentPage], () => {
    // Actualizar los query params en la URL usando Vue Router
    // Esto NO causa una recarga completa de la página
    router.push({
        query: {
            // Conserva otros query params si existen y no los gestionas aquí
            ...route.query,
            search: searchTerm.value || undefined, // undefined para quitar el param si está vacío
            class_id: class_id.value || undefined,
            page: currentPage.value > 1 ? currentPage.value : undefined // undefined para quitar page=1
        }
    });
    // La carga de datos ahora se disparará por el watcher de route.query
}, { deep: true }); // deep puede no ser necesario si observas refs directamente


// Observa los cambios en los query params de la URL para disparar la carga de datos
// Esto asegura que si el usuario navega (atrás/adelante) o la URL cambia externamente, los datos se carguen.
watch(() => route.query, (newQuery) => {
        console.log("Route query changed:", newQuery);
        // Actualizar estado local desde la URL (sincronización)
        searchTerm.value = newQuery.search?.toString() ?? '';
        class_id.value = newQuery.class_id?.toString() ?? '';
        currentPage.value = parseInt(newQuery.page?.toString() ?? '1');
        fetchStudents(); // Cargar datos basados en la nueva URL
    },
    { immediate: false } // No llamar inmediatamente, onMounted ya lo hace
);

// Resetear página a 1 cuando cambian los filtros (antes de que el watcher principal actualice la URL)
watch([searchTerm, class_id], () => {
    if (currentPage.value !== 1) {
         currentPage.value = 1;
    }
});


// --- Lógica de Paginación (Manejada por el componente Pagination) ---
// Ya no se necesita pageNumberUpdated. El componente Pagination emitirá un evento.
const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationMeta.value?.last_page ?? 1)) {
        currentPage.value = newPage; // El watcher [searchTerm, class_id, currentPage] se encargará del resto
    }
};


// --- Ciclo de Vida ---
onMounted(() => {
    document.title = 'Students'; // Reemplazo de <Head>
    fetchClasses(); // Cargar clases una vez
    fetchStudents(); // Cargar estudiantes iniciales basados en la URL actual
});

</script>

<template>
    <!-- <Head title="Students" /> Reemplazado por document.title -->

    <!-- <template #header> ... </template> No es estándar en Vue sin un Layout específico -->

    <div class="bg-gray-100 py-10">
        <div class="mx-auto max-w-7xl">
            <div class="px-4 sm:px-6 lg:px-8">
                <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                        <h1 class="text-xl font-semibold text-gray-900">
                            Students
                        </h1>
                        <p class="mt-2 text-sm text-gray-700">
                            A list of all the Students.
                        </p>
                    </div>

                    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <!-- Reemplazar <Link> con <router-link> si necesitas el botón Add -->
                         <router-link
                            :to="{ name: 'student.create' }" 
                            v-if="$router.hasRoute('student.create')" 
                            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            Add Student
                        </router-link>
                    </div>
                </div>

                <!-- Filtros -->
                <div class="flex flex-col gap-4 sm:flex-row mt-6 mb-6">
                    <!-- Búsqueda -->
                    <div class="relative text-sm text-gray-800">
                        <div class="absolute pl-3 left-0 top-0 bottom-0 flex items-center pointer-events-none text-gray-500">
                            <!-- <MagnifyingGlass /> -->
                        </div>
                        <input
                            type="text"
                            v-model="searchTerm"
                            placeholder="Search name or email..."
                            id="search"
                            class="block w-full sm:w-auto rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <!-- Filtro por Clase -->
                    <select
                        v-model="class_id"
                        class="block w-full sm:w-auto rounded-lg border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">Filter By Class (All)</option>
                        <option
                            :value="item.id"
                            :key="item.id"
                            v-for="item in classes" 
                        >
                            {{ item.name }}
                        </option>
                    </select>
                </div>

                 <!-- Indicador de Carga y Error -->
                 <div v-if="isLoading" class="text-center py-4 text-gray-500">
                    Loading students...
                 </div>
                 <div v-if="fetchError" class="text-center py-4 text-red-600 bg-red-100 border border-red-400 rounded p-3">
                    {{ fetchError }}
                 </div>

                <!-- Tabla -->
                <div v-if="!isLoading && !fetchError" class="mt-8 flex flex-col">
                    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg relative">
                                <table class="min-w-full divide-y divide-gray-300">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                                            <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Class</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Section</th>
                                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                                            <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 bg-white">
                                        <tr v-if="students.length === 0">
                                             <td colspan="7" class="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500 sm:pl-6">
                                                No students found matching your criteria.
                                            </td>
                                        </tr>
                                        <tr v-else v-for="student in students" :key="student.id">
                                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ student.id }}</td>
                                            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ student.name }}</td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ student.email }}</td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ student.class.name }}</td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ student.section.name }}</td>
                                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ student.created_at_formatted }}</td>
                                            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <!-- Reemplazar <Link> con <router-link> si necesitas el botón Edit -->
                                                <router-link
                                                    :to="{ name: 'student.edit', params: { id: student.id } }" 
                                                     v-if="$router.hasRoute('student.edit')"
                                                    class="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit<span class="sr-only">, {{ student.name }}</span>
                                                </router-link>
                                                <button
                                                    @click="deleteStudent(student.id)"
                                                    class="ml-3 text-red-600 hover:text-red-900"
                                                >
                                                    Delete<span class="sr-only">, {{ student.name }}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Paginación Adaptada -->
                            <!-- Asegúrate que tu componente Pagination acepta estas props
                                 o ajusta las props según necesite tu componente -->
                            <!-- <Pagination
                                v-if="paginationMeta && paginationMeta.last_page > 1"
                                :currentPage="paginationMeta.current_page"
                                :totalPages="paginationMeta.last_page"
                                :totalItems="paginationMeta.total"
                                :from="paginationMeta.from"
                                :to="paginationMeta.to"
                                @page-changed="handlePageChange" 
                                class="mt-4"
                             /> -->
                             <!-- Alternativa si tu componente Pagination es más simple:
                             <PaginationSimple
                                 v-if="paginationMeta && paginationMeta.last_page > 1"
                                 :currentPage="paginationMeta.current_page"
                                 :totalPages="paginationMeta.last_page"
                                 @update:currentPage="handlePageChange"
                             /> -->

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos específicos si son necesarios */
</style>