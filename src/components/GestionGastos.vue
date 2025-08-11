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

      <!-- Vista de Tabla -->
      <div
        class="overflow-x-auto lg:overflow-x-visible border border-gray-200 rounded-lg"
      >
        <table class="w-full lg:table-fixed divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-2 lg:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 lg:w-20"
              >
                📅 Fecha
              </th>
              <th
                class="px-2 lg:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                📝 Descripción
              </th>
              <th
                class="px-2 lg:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20 lg:w-24"
              >
                💰 Monto
              </th>
              <th
                class="px-2 lg:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 lg:w-32"
              >
                💳 Pagado por
              </th>
              <!-- Columnas dinámicas por participante -->
              <th
                v-for="participante in viaje.participantes"
                :key="participante.id"
                class="px-1 lg:px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12 lg:w-16"
                :title="participante.nombre"
              >
                <div class="flex flex-col items-center space-y-1">
                  <div
                    class="w-5 lg:w-6 h-5 lg:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    :style="{
                      backgroundColor: obtenerColorParticipante(
                        participante.id
                      ),
                    }"
                  >
                    {{ obtenerInicialesNombre(participante.nombre) }}
                  </div>
                  <span
                    class="text-[9px] lg:text-[10px] leading-tight hidden lg:block"
                  >
                    {{ obtenerNombreCorto(participante.nombre) }}
                  </span>
                </div>
              </th>
              <th
                class="px-2 lg:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20 lg:w-24"
              >
                🔢 Por persona
              </th>
              <th
                class="px-2 lg:px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16 lg:w-20"
              >
                ⚙️ Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template
              v-for="(fecha, fechaIndex) in fechasOrdenadas"
              :key="fecha"
            >
              <!-- Separador de fecha -->
              <tr class="bg-blue-50 border-t-2 border-blue-200">
                <td
                  :colspan="4 + viaje.participantes.length + 2"
                  class="px-3 py-3 text-center"
                >
                  <div class="flex items-center justify-center space-x-2">
                    <span
                      class="text-sm font-semibold text-blue-700 uppercase tracking-wide"
                    >
                      📅 {{ formatearFechaSeparador(fecha) }}
                    </span>
                    <span
                      class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full"
                    >
                      {{ gastosAgrupadosPorFecha[fecha].length }} gasto{{
                        gastosAgrupadosPorFecha[fecha].length !== 1 ? "s" : ""
                      }}
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Gastos de esa fecha -->
              <tr
                v-for="(gasto, gastoIndex) in gastosAgrupadosPorFecha[fecha]"
                :key="gasto.id"
                :class="[
                  obtenerClaseFilaAlternada(fechaIndex, gastoIndex),
                  'hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-300',
                ]"
              >
                <td
                  class="px-2 lg:px-3 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <div class="font-medium text-xs lg:text-sm">
                    {{ formatearFechaTabla(gasto.fecha) }}
                  </div>
                </td>
                <td class="px-2 lg:px-3 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ gasto.descripcion }}
                  </div>
                </td>
                <td class="px-2 lg:px-3 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-bold text-green-600">
                    ${{ formatearMoneda(gasto.monto) }}
                  </div>
                </td>
                <td class="px-2 lg:px-3 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-5 lg:w-6 h-5 lg:h-6 rounded-full flex items-center justify-center mr-1 lg:mr-2"
                      :style="{
                        backgroundColor: obtenerColorParticipante(
                          gasto.pagadoPorId
                        ),
                      }"
                    >
                      <span class="text-white font-semibold text-xs">
                        {{
                          obtenerInicialesNombre(
                            obtenerNombreParticipante(gasto.pagadoPorId)
                          )
                        }}
                      </span>
                    </div>
                    <div class="text-xs lg:text-sm text-gray-900 truncate">
                      {{
                        obtenerNombreCorto(
                          obtenerNombreParticipante(gasto.pagadoPorId)
                        )
                      }}
                    </div>
                  </div>
                </td>
                <!-- Celdas de participación por participante -->
                <td
                  v-for="participante in viaje.participantes"
                  :key="participante.id"
                  class="px-1 lg:px-2 py-4 whitespace-nowrap text-center"
                >
                  <div class="flex justify-center">
                    <span
                      v-if="
                        gasto.participantesDeudaIds.includes(participante.id)
                      "
                      class="inline-flex items-center justify-center w-4 lg:w-5 h-4 lg:h-5 bg-green-100 text-green-600 rounded-full text-xs"
                      :title="`${participante.nombre} participa en este gasto`"
                    >
                      ✓
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center justify-center w-4 lg:w-5 h-4 lg:h-5 bg-gray-100 text-gray-400 rounded-full text-xs"
                      :title="`${participante.nombre} no participa en este gasto`"
                    >
                      ✗
                    </span>
                  </div>
                </td>
                <td class="px-2 lg:px-3 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-medium text-primary-600">
                    ${{
                      formatearMoneda(
                        gasto.monto / gasto.participantesDeudaIds.length
                      )
                    }}
                  </div>
                </td>
                <td class="px-2 lg:px-3 py-4 whitespace-nowrap text-center">
                  <button
                    @click="eliminarGastoConfirm(gasto.id, gasto.descripcion)"
                    class="text-red-500 hover:text-red-700 p-1 lg:p-2 rounded-md hover:bg-red-50 transition-colors text-sm"
                    title="Eliminar gasto"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </template>
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
const { agregarGasto, eliminarGasto, obtenerColorParticipante } = useStorage();

// Estado reactivo
const formulario = ref({
  descripcion: "",
  monto: 0,
  fechaGasto: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
  pagadoPorId: "",
  participantesDeudaIds: [] as string[],
});

// Computed
const gastosOrdenados = computed(() => {
  return [...props.viaje.gastos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
});

const gastosAgrupadosPorFecha = computed(() => {
  const grupos: { [fecha: string]: typeof props.viaje.gastos } = {};

  gastosOrdenados.value.forEach((gasto) => {
    // Extraer solo la fecha sin procesar como Date para evitar problemas de zona horaria
    let fechaSolo = gasto.fecha.split("T")[0]; // Obtener solo la fecha sin hora

    // Si la fecha tiene formato ISO, la usamos directamente
    if (!fechaSolo.includes("-")) {
      // Si por alguna razón no está en formato ISO, intentamos extraerla
      const fechaObj = new Date(gasto.fecha);
      const year = fechaObj.getFullYear();
      const month = String(fechaObj.getMonth() + 1).padStart(2, "0");
      const day = String(fechaObj.getDate()).padStart(2, "0");
      fechaSolo = `${year}-${month}-${day}`;
    }

    if (!grupos[fechaSolo]) {
      grupos[fechaSolo] = [];
    }
    grupos[fechaSolo].push(gasto);
  });

  return grupos;
});

const fechasOrdenadas = computed(() => {
  return Object.keys(gastosAgrupadosPorFecha.value).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
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

const obtenerNombreCorto = (nombre: string): string => {
  const palabras = nombre.split(" ");
  if (palabras.length === 1) return palabras[0];
  return palabras[0] + " " + palabras[palabras.length - 1];
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
  // Extraer la fecha sin la hora para evitar problemas de zona horaria
  const fechaSolo = fecha.split("T")[0];
  const [year, month, day] = fechaSolo.split("-").map(Number);
  const fechaLocal = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11

  return fechaLocal.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatearFechaSeparador = (fecha: string): string => {
  // Crear fecha local para evitar problemas de zona horaria
  const [year, month, day] = fecha.split("-").map(Number);
  const fechaLocal = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11

  return fechaLocal.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const obtenerClaseFilaAlternada = (
  fechaIndex: number,
  gastoIndex: number
): string => {
  const esFilaPar = (fechaIndex + gastoIndex) % 2 === 0;
  return esFilaPar ? "bg-white" : "bg-gray-50";
};
</script>
