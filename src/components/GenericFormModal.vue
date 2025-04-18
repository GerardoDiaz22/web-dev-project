// src/components/GenericFormModal.vue
<script setup>
import { ref, watch, computed, onMounted, onUpdated } from 'vue';
import { Modal } from 'flowbite'; // Importa la clase Modal de Flowbite

const props = defineProps({
  // v-model para controlar la visibilidad desde el padre
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Formulario',
  },
  // Array de objetos que definen los campos del formulario
  // Ejemplo: [{ key: 'nombre', label: 'Nombre', type: 'text', required: true }, ...]
  fields: {
    type: Array,
    required: true,
    default: () => [],
  },
  // Datos iniciales para pre-rellenar el formulario (para editar)
  initialData: {
    type: Object,
    default: () => ({}),
  },
  // Texto del botón de envío
  submitButtonText: {
    type: String,
    default: 'Guardar',
  },
  // Texto del botón de cancelar
  cancelButtonText: {
    type: String,
    default: 'Cancelar',
  },
});

// --- Emits ---
const emit = defineEmits(['update:modelValue', 'submit']);

// --- State ---
const formData = ref({});
const modalElement = ref(null); // Referencia al elemento del modal en el DOM
const flowbiteModalInstance = ref(null); // Instancia del modal de Flowbite

// --- Computadas ---
const isVisible = computed(() => props.modelValue);

// --- Observadores (Watchers) ---

// Observa los datos iniciales para llenar el formulario cuando se abre para editar
// y también para resetear cuando se abre para añadir (initialData será {} o null)
watch(() => props.initialData, (newData) => {
    // Crear una copia para no mutar la prop directamente
    formData.value = { ...newData };
    // Asegurar que todas las keys definidas en 'fields' existen en formData
    props.fields.forEach(field => {
        if (!(field.key in formData.value)) {
            formData.value[field.key] = getDefaultValue(field.type, field.options);
        }
    });
}, { immediate: true, deep: true }); // immediate para inicializar, deep por si initialData es complejo

// Observa el v-model (isVisible) para mostrar/ocultar el modal de Flowbite
watch(isVisible, (newValue) => {
  if (flowbiteModalInstance.value) {
    if (newValue) {
      flowbiteModalInstance.value.show();
    } else {
      flowbiteModalInstance.value.hide();
    }
  } else if (newValue && modalElement.value) {
      // Si la instancia no existe aún, inicializarla al mostrar
      initializeModal();
      if (flowbiteModalInstance.value) {
          flowbiteModalInstance.value.show();
      }
  }
});




// --- Métodos ---

function getDefaultValue(type,options) {
    switch(type) {
        case 'number': return 0;
        case 'checkbox': return false;
        case 'select':
            return options?.[0]?.value ?? '';
        default: return '';
    }
}

function closeModal() {
  emit('update:modelValue', false); // Notifica al padre para cerrar (v-model)
}

function submitForm() {
  emit('submit', { ...formData.value });
  closeModal(); 
}

// Inicializa la instancia del modal de Flowbite
function initializeModal() {
    if (modalElement.value && !flowbiteModalInstance.value) {
        const options = {
            placement: 'center',
            backdrop: 'static',
            backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
            closable: true, // Permite cerrar con ESC o botón de cierre
            onHide: () => {
                // Asegurarse de que el v-model se actualice si Flowbite cierra el modal
                // (p.ej. con la tecla ESC o el botón de cierre)
                if (props.modelValue) {
                     emit('update:modelValue', false);
                }
            },
        };
        flowbiteModalInstance.value = new Modal(modalElement.value, options);
    }
}

// --- Ciclo de Vida ---
onMounted(() => {
    // Si el modal debe ser visible al montar, inicializar y mostrar
    if (modalElement.value) {
        initializeModal();
        if (props.modelValue && flowbiteModalInstance.value) {
            flowbiteModalInstance.value.show();
        }
    }
});


</script>

<template>
  <!-- Main modal -->
  <div
    ref="modalElement"
    :id="'genericFormModal-' + Date.now()"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-w-md max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <button
          @click="closeModal"
          type="button"
          class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span class="sr-only">Cerrar modal</span>
        </button>
        <div class="px-6 py-6 lg:px-8">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{{ title }}</h3>
          <form class="space-y-6" @submit.prevent="submitForm">
            <div v-for="field in fields" :key="field.key">
              <label
                :for="field.key"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {{ field.label }} <span v-if="field.required" class="text-red-500">*</span>
              </label>

               <!-- *** INICIO: Bloque Modificado para Select *** -->
               <select
                v-if="field.type === 'select'"
                :name="field.key"
                :id="field.key"
                v-model="formData[field.key]"
                :required="field.required"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              >
                <option
                  v-for="option in field.options"
                  :key="option.value"
                  :value="option.value"
                  :disabled="option.value === '' && field.required"  
                >
                  {{ option.text }}
                </option>
              </select>

              <input
                v-else-if="field.type !== 'checkbox'"
                :type="field.type || 'text'"
                :name="field.key"
                :id="field.key"
                v-model="formData[field.key]"
                :required="field.required"
                :placeholder="field.placeholder || ''"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              >
             

            </div>

            <div class="flex justify-end space-x-3">
                 <button
                    @click="closeModal"
                    type="button"
                    class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                    {{ cancelButtonText }}
                </button>
                <button
                    type="submit"
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    {{ submitButtonText }}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>