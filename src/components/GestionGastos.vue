<template>
  <div class="space-y-6">
    <!-- Formulario Agregar Gasto -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Registrar Nuevo Gasto
      </h3>

      <div
        v-if="viaje.participantes.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <p class="text-lg mb-2">👥 Necesitas agregar participantes primero</p>
        <p class="text-sm">
          Ve a la pestaña "Participantes" para agregar personas al viaje
        </p>
      </div>

      <form v-else @submit.prevent="agregarNuevoGasto" class="space-y-4">
        <!-- Descripción del Gasto -->
        <div>
          <label
            for="descripcion"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Descripción del Gasto
          </label>
          <input
            id="descripcion"
            v-model="formulario.descripcion"
            type="text"
            class="input-field"
            placeholder="Ej: Hotel, Cena, Gasolina"
            required
          />
        </div>

        <!-- Monto -->
        <div>
          <label
            for="monto"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Monto ($)
          </label>
          <input
            id="monto"
            v-model.number="formulario.monto"
            type="number"
            step="0.01"
            min="0"
            class="input-field"
            placeholder="0.00"
            required
          />
        </div>

        <!-- Fecha del Gasto -->
        <div>
          <label
            for="fechaGasto"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Fecha del Gasto
          </label>
          <input
            id="fechaGasto"
            v-model="formulario.fechaGasto"
            type="date"
            class="input-field"
            required
          />
        </div>

        <!-- Pagado por -->
        <div>
          <label
            for="pagadoPor"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Pagado por
          </label>
          <select
            id="pagadoPor"
            v-model="formulario.pagadoPorId"
            class="input-field"
            required
          >
            <option value="">Selecciona quien pagó</option>
            <option
              v-for="participante in viaje.participantes"
              :key="participante.id"
              :value="participante.id"
            >
              {{ participante.nombre }}
            </option>
          </select>
        </div>

        <!-- Participantes de la Deuda -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ¿Quiénes deben pagar por este gasto?
          </label>
          <div class="space-y-2">
            <label
              v-for="participante in viaje.participantes"
              :key="participante.id"
              class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                v-model="formulario.participantesDeudaIds"
                type="checkbox"
                :value="participante.id"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-gray-900">{{ participante.nombre }}</span>
            </label>
          </div>
          <div class="mt-2 flex space-x-2">
            <button
              type="button"
              @click="seleccionarTodos"
              class="text-sm text-primary-600 hover:text-primary-800"
            >
              Seleccionar todos
            </button>
            <span class="text-gray-300">|</span>
            <button
              type="button"
              @click="deseleccionarTodos"
              class="text-sm text-primary-600 hover:text-primary-800"
            >
              Deseleccionar todos
            </button>
          </div>
        </div>

        <!-- Resumen del Gasto -->
        <div
          v-if="formulario.participantesDeudaIds.length > 0"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 class="text-sm font-medium text-blue-800 mb-2">
            Resumen del gasto:
          </h4>
          <div class="text-sm text-blue-700">
            <p>
              Cada persona debe pagar:
              <span class="font-semibold">
                ${{
                  formatearMoneda(
                    formulario.monto / formulario.participantesDeudaIds.length
                  )
                }}
              </span>
            </p>
            <p class="mt-1">
              Participantes:
              {{ formulario.participantesDeudaIds.length }} persona{{
                formulario.participantesDeudaIds.length !== 1 ? "s" : ""
              }}
            </p>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex space-x-3">
          <button
            type="submit"
            class="btn-primary"
            :disabled="formulario.participantesDeudaIds.length === 0"
          >
            Registrar Gasto
          </button>
          <button
            type="button"
            @click="limpiarFormulario"
            class="btn-secondary"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de Gastos -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Gastos Registrados ({{ viaje.gastos.length }})
        </h3>
        <div class="flex items-center space-x-4">
          <div v-if="viaje.gastos.length > 0" class="text-sm text-gray-600">
            Total: ${{ formatearMoneda(totalGastos) }}
          </div>
          <!-- Botones para cambiar vista -->
          <div
            v-if="viaje.gastos.length > 0"
            class="flex rounded-lg border border-gray-300 overflow-hidden"
          >
            <button
              @click="vistaTabla = false"
              :class="[
                'px-3 py-1 text-sm font-medium transition-colors',
                !vistaTabla
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ]"
              title="Vista de tarjetas"
            >
              📄 Tarjetas
            </button>
            <button
              @click="vistaTabla = true"
              :class="[
                'px-3 py-1 text-sm font-medium transition-colors',
                vistaTabla
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50',
              ]"
              title="Vista de tabla"
            >
              📊 Tabla
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="viaje.gastos.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <p class="text-lg mb-2">💸 No hay gastos registrados</p>
        <p class="text-sm">
          Registra el primer gasto del viaje usando el formulario superior
        </p>
      </div>

      <!-- Vista de Tarjetas -->
      <div v-else-if="!vistaTabla" class="space-y-3">
        <div
          v-for="gasto in gastosOrdenados"
          :key="gasto.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-medium text-gray-900">
                  {{ gasto.descripcion }}
                </h4>
                <div class="text-right">
                  <div class="text-xl font-bold text-gray-900">
                    ${{ formatearMoneda(gasto.monto) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formatearFecha(gasto.fecha) }}
                  </div>
                </div>
              </div>

              <div class="text-sm text-gray-600 space-y-1">
                <p>
                  <span class="font-medium">Pagado por:</span>
                  {{ obtenerNombreParticipante(gasto.pagadoPorId) }}
                </p>
                <p>
                  <span class="font-medium">Participantes:</span>
                  {{ obtenerNombresParticipantes(gasto.participantesDeudaIds) }}
                </p>
                <p>
                  <span class="font-medium">Por persona:</span>
                  ${{
                    formatearMoneda(
                      gasto.monto / gasto.participantesDeudaIds.length
                    )
                  }}
                </p>
              </div>
            </div>

            <button
              @click="eliminarGastoConfirm(gasto.id, gasto.descripcion)"
              class="ml-4 text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
              title="Eliminar gasto"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Vista de Tabla -->
      <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                📅 Fecha
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                📝 Descripción
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                💰 Monto
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                💳 Pagado por
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                👥 Participantes
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                🔢 Por persona
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ⚙️ Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="gasto in gastosOrdenados"
              :key="gasto.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">
                  {{ formatearFechaTabla(gasto.fecha) }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ gasto.descripcion }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-bold text-green-600">
                  ${{ formatearMoneda(gasto.monto) }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3"
                  >
                    <span class="text-primary-600 font-semibold text-xs">
                      {{
                        obtenerInicialesNombre(
                          obtenerNombreParticipante(gasto.pagadoPorId)
                        )
                      }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-900">
                    {{ obtenerNombreParticipante(gasto.pagadoPorId) }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 max-w-xs">
                <div
                  class="text-sm text-gray-900 truncate"
                  :title="
                    obtenerNombresParticipantes(gasto.participantesDeudaIds)
                  "
                >
                  {{ obtenerNombresParticipantes(gasto.participantesDeudaIds) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ gasto.participantesDeudaIds.length }} persona{{
                    gasto.participantesDeudaIds.length !== 1 ? "s" : ""
                  }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right">
                <div class="text-sm font-medium text-primary-600">
                  ${{
                    formatearMoneda(
                      gasto.monto / gasto.participantesDeudaIds.length
                    )
                  }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-center">
                <button
                  @click="eliminarGastoConfirm(gasto.id, gasto.descripcion)"
                  class="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                  title="Eliminar gasto"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";

// Props
const props = defineProps<{
  viaje: Viaje;
}>();

// Emits
const emit = defineEmits<{
  gastoAgregado: [];
  gastoEliminado: [];
}>();

// Composables
const { agregarGasto, eliminarGasto } = useStorage();

// Estado reactivo
const formulario = ref({
  descripcion: "",
  monto: 0,
  fechaGasto: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
  pagadoPorId: "",
  participantesDeudaIds: [] as string[],
});

const vistaTabla = ref(false); // false = vista de cards, true = vista de tabla

// Computed
const gastosOrdenados = computed(() => {
  return [...props.viaje.gastos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
});

const totalGastos = computed(() => {
  return props.viaje.gastos.reduce((total, gasto) => total + gasto.monto, 0);
});

// Watcher para seleccionar automáticamente todos los participantes cuando cambian
watch(
  () => props.viaje.participantes,
  (newParticipantes) => {
    if (
      newParticipantes.length > 0 &&
      formulario.value.participantesDeudaIds.length === 0
    ) {
      formulario.value.participantesDeudaIds = newParticipantes.map(
        (p) => p.id
      );
    }
  },
  { immediate: true, deep: true }
);

// Métodos
const agregarNuevoGasto = (): void => {
  if (formulario.value.participantesDeudaIds.length === 0) {
    alert("Debes seleccionar al menos un participante que deba pagar");
    return;
  }

  const gasto = agregarGasto(
    props.viaje.id,
    formulario.value.descripcion,
    formulario.value.monto,
    formulario.value.pagadoPorId,
    formulario.value.participantesDeudaIds,
    formulario.value.fechaGasto
  );

  if (gasto) {
    limpiarFormulario();
    emit("gastoAgregado");
  }
};

const eliminarGastoConfirm = (id: string, descripcion: string): void => {
  if (
    confirm(
      `¿Estás seguro de que quieres eliminar el gasto "${descripcion}"? Esta acción no se puede deshacer.`
    )
  ) {
    eliminarGasto(props.viaje.id, id);
    emit("gastoEliminado");
  }
};

const limpiarFormulario = (): void => {
  formulario.value = {
    descripcion: "",
    monto: 0,
    fechaGasto: new Date().toISOString().split("T")[0], // Resetear a fecha de hoy
    pagadoPorId: "",
    participantesDeudaIds: props.viaje.participantes.map((p) => p.id), // Seleccionar todos automáticamente
  };
};

const seleccionarTodos = (): void => {
  formulario.value.participantesDeudaIds = props.viaje.participantes.map(
    (p) => p.id
  );
};

const deseleccionarTodos = (): void => {
  formulario.value.participantesDeudaIds = [];
};

const obtenerNombreParticipante = (id: string): string => {
  const participante = props.viaje.participantes.find((p) => p.id === id);
  return participante?.nombre || "Desconocido";
};

const obtenerNombresParticipantes = (ids: string[]): string => {
  const nombres = ids.map((id) => obtenerNombreParticipante(id));
  return nombres.join(", ");
};

const obtenerInicialesNombre = (nombre: string): string => {
  return nombre
    .split(" ")
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatearFechaTabla = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
</script>
