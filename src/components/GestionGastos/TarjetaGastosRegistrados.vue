<template>
  <!-- Lista de Gastos -->
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">
        Gastos Registrados ({{ viaje.gastos.length }})
      </h3>
      <div class="flex items-center space-x-4">
        <div v-if="viaje.gastos.length > 0" class="text-sm text-gray-600">
          Total: ${{ formatearMoneda(totalGastos) }}
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div v-if="viaje.gastos.length > 0" class="p-4 mb-4 rounded-lg bg-gray-50">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label for="filtro-pagador" class="text-sm font-medium text-gray-700">
            🔍 Filtrar por quien pagó:
          </label>
          <select
            id="filtro-pagador"
            v-model="filtroPagador"
            class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los pagadores</option>
            <option
              v-for="participante in viaje.participantes"
              :key="participante.id"
              :value="participante.id"
            >
              {{ participante.nombre }}
            </option>
          </select>
        </div>
        <button
          v-if="filtroPagador"
          @click="limpiarFiltros"
          class="text-xs text-gray-500 underline hover:text-gray-700"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <div
      v-if="viaje.gastos.length === 0"
      class="py-8 text-center text-gray-500"
    >
      <p class="mb-2 text-lg">💸 No hay gastos registrados</p>
      <p class="text-sm">
        Registra el primer gasto del viaje usando el formulario superior
      </p>
    </div>

    <!-- Vista de Tabla -->
    <div
      class="overflow-x-auto border border-gray-200 rounded-lg lg:overflow-x-visible"
    >
      <table class="w-full divide-y divide-gray-200 lg:table-fixed">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="w-16 px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3 lg:w-20"
            >
              📅 Fecha
            </th>
            <th
              class="px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3"
            >
              📝 Descripción
            </th>
            <th
              class="w-20 px-2 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase lg:px-3 lg:w-24"
            >
              💰 Monto
            </th>
            <th
              class="w-24 px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3 lg:w-32"
            >
              💳 Pagado por
            </th>
            <!-- Columnas dinámicas por participante -->
            <th
              v-for="participante in viaje.participantes"
              :key="participante.id"
              class="w-12 px-1 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase lg:px-2 lg:w-16"
              :title="participante.nombre"
            >
              <div class="flex flex-col items-center space-y-1">
                <div
                  class="flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full lg:w-6 lg:h-6"
                  :style="{
                    backgroundColor: obtenerColorParticipante(participante.id),
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
              class="w-20 px-2 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase lg:px-3 lg:w-24"
            >
              🔢 Por persona
            </th>
            <th
              class="w-16 px-2 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase lg:px-3 lg:w-20"
            >
              ⚙️ Acciones
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <template v-for="(fecha, fechaIndex) in fechasOrdenadas" :key="fecha">
            <!-- Separador de fecha -->
            <tr class="border-t-2 border-blue-200 bg-blue-50">
              <td
                :colspan="4 + viaje.participantes.length + 2"
                class="px-3 py-3 text-center"
              >
                <div class="flex items-center justify-center space-x-2">
                  <span
                    class="text-sm font-semibold tracking-wide text-blue-700 uppercase"
                  >
                    📅 {{ formatearFechaSeparador(fecha) }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full"
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
                class="px-2 py-4 text-sm text-gray-900 lg:px-3 whitespace-nowrap"
              >
                <div class="text-xs font-medium lg:text-sm">
                  {{ formatearFechaTabla(gasto.fecha) }}
                </div>
              </td>
              <td class="px-2 py-4 lg:px-3">
                <div class="text-sm font-medium text-gray-900">
                  {{ gasto.descripcion }}
                </div>
              </td>
              <td class="px-2 py-4 text-right lg:px-3 whitespace-nowrap">
                <div class="text-sm font-bold text-green-600">
                  ${{ formatearMoneda(gasto.monto) }}
                </div>
              </td>
              <td class="px-2 py-4 lg:px-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex items-center justify-center w-5 h-5 mr-1 rounded-full lg:w-6 lg:h-6 lg:mr-2"
                    :style="{
                      backgroundColor: obtenerColorParticipante(
                        gasto.pagadoPorId
                      ),
                    }"
                  >
                    <span class="text-xs font-semibold text-white">
                      {{
                        obtenerInicialesNombre(
                          obtenerNombreParticipante(gasto.pagadoPorId)
                        )
                      }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-900 truncate lg:text-sm">
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
                class="px-1 py-4 text-center lg:px-2 whitespace-nowrap"
              >
                <div class="flex justify-center">
                  <span
                    v-if="gasto.participantesDeudaIds.includes(participante.id)"
                    class="inline-flex items-center justify-center w-4 h-4 text-xs text-green-600 bg-green-100 rounded-full lg:w-5 lg:h-5"
                    :title="`${participante.nombre} participa en este gasto`"
                  >
                    ✓
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center justify-center w-4 h-4 text-xs text-red-600 bg-red-100 rounded-full lg:w-5 lg:h-5"
                    :title="`${participante.nombre} no participa en este gasto`"
                  >
                    ✗
                  </span>
                </div>
              </td>
              <td class="px-2 py-4 text-right lg:px-3 whitespace-nowrap">
                <div class="text-sm font-medium text-primary-600">
                  ${{
                    formatearMoneda(
                      gasto.monto / gasto.participantesDeudaIds.length
                    )
                  }}
                </div>
              </td>
              <td class="px-2 py-4 text-center lg:px-3 whitespace-nowrap">
                <div class="flex items-center justify-center space-x-1">
                  <button
                    @click="editarGasto(gasto)"
                    class="p-1 text-sm text-blue-500 transition-colors rounded-md hover:text-blue-700 lg:p-2 hover:bg-blue-50"
                    title="Editar gasto"
                  >
                    ✏️
                  </button>
                  <button
                    @click="eliminarGastoConfirm(gasto.id, gasto.descripcion)"
                    class="p-1 text-sm text-red-500 transition-colors rounded-md hover:text-red-700 lg:p-2 hover:bg-red-50"
                    title="Eliminar gasto"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>

        <thead class="bg-gray-50">
          <tr>
            <th
              class="w-16 px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3 lg:w-20"
            >
              📅 Fecha
            </th>
            <th
              class="px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3"
            >
              📝 Descripción
            </th>
            <th
              class="w-20 px-2 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase lg:px-3 lg:w-24"
            >
              💰 Monto
            </th>
            <th
              class="w-24 px-2 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase lg:px-3 lg:w-32"
            >
              💳 Pagado por
            </th>
            <!-- Columnas dinámicas por participante -->
            <th
              v-for="participante in viaje.participantes"
              :key="participante.id"
              class="w-12 px-1 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase lg:px-2 lg:w-16"
              :title="participante.nombre"
            >
              <div class="flex flex-col items-center space-y-1">
                <div
                  class="flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full lg:w-6 lg:h-6"
                  :style="{
                    backgroundColor: obtenerColorParticipante(participante.id),
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
              class="w-20 px-2 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase lg:px-3 lg:w-24"
            >
              🔢 Por persona
            </th>
            <th
              class="w-16 px-2 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase lg:px-3 lg:w-20"
            >
              ⚙️ Acciones
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- Modal de Edición de Gasto -->
    <div
      v-if="mostrarModalEdicion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="cerrarModalEdicion"
    >
      <div
        class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">✏️ Editar Gasto</h3>
          <button
            @click="cerrarModalEdicion"
            class="p-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="guardarEdicionGasto" class="space-y-4">
          <!-- Descripción -->
          <div>
            <label
              for="editar-descripcion"
              class="block mb-1 text-sm font-medium text-gray-700"
            >
              📝 Descripción del gasto
            </label>
            <input
              id="editar-descripcion"
              v-model="formularioEdicion.descripcion"
              type="text"
              required
              class="input-field"
              placeholder="Ej: Cena en restaurante"
            />
          </div>

          <!-- Monto -->
          <div>
            <label
              for="editar-monto"
              class="block mb-1 text-sm font-medium text-gray-700"
            >
              💰 Monto
            </label>
            <input
              id="editar-monto"
              v-model.number="formularioEdicion.monto"
              type="number"
              min="0"
              step="0.01"
              required
              class="input-field"
              placeholder="0"
            />
          </div>

          <!-- Fecha -->
          <div>
            <label
              for="editar-fecha"
              class="block mb-1 text-sm font-medium text-gray-700"
            >
              📅 Fecha del gasto
            </label>
            <input
              id="editar-fecha"
              v-model="formularioEdicion.fechaGasto"
              type="date"
              required
              class="input-field"
            />
          </div>

          <!-- Pagado por -->
          <div>
            <label
              for="editar-pagado-por"
              class="block mb-1 text-sm font-medium text-gray-700"
            >
              💳 Pagado por
            </label>
            <select
              id="editar-pagado-por"
              v-model="formularioEdicion.pagadoPorId"
              required
              class="input-field"
            >
              <option value="" disabled>Selecciona quien pagó</option>
              <option
                v-for="participante in viaje.participantes"
                :key="participante.id"
                :value="participante.id"
              >
                {{ participante.nombre }}
              </option>
            </select>
          </div>

          <!-- Participantes que deben -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              👥 ¿Quiénes deben pagar este gasto?
            </label>
            <div class="space-y-2">
              <div
                v-for="participante in viaje.participantes"
                :key="participante.id"
                class="flex items-center"
              >
                <input
                  :id="`editar-participante-${participante.id}`"
                  v-model="formularioEdicion.participantesDeudaIds"
                  :value="participante.id"
                  type="checkbox"
                  class="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
                <label
                  :for="`editar-participante-${participante.id}`"
                  class="ml-2 text-sm text-gray-900"
                >
                  {{ participante.nombre }}
                </label>
              </div>
            </div>

            <div class="flex mt-3 space-x-2">
              <button
                type="button"
                @click="seleccionarTodosEdicion"
                class="text-xs text-primary-600 hover:text-primary-800"
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                @click="deseleccionarTodosEdicion"
                class="text-xs text-gray-600 hover:text-gray-800"
              >
                Deseleccionar todos
              </button>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              @click="cerrarModalEdicion"
              class="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="formularioEdicion.participantesDeudaIds.length === 0"
              class="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";

// Props
const props = defineProps<{
  viaje: Viaje;
}>();

// Emits
const emit = defineEmits<{
  gastoEliminado: [];
  gastoEditado: [];
}>();

// Composables
const { eliminarGasto, editarGastoExistente, obtenerColorParticipante } =
  useStorage();

// Estado para filtros
const filtroPagador = ref("");

// Estado para edición
const mostrarModalEdicion = ref(false);
const gastoEditando = ref<string | null>(null);
const formularioEdicion = ref({
  descripcion: "",
  monto: 0,
  fechaGasto: "",
  pagadoPorId: "",
  participantesDeudaIds: [] as string[],
});

// Computed
const gastosOrdenados = computed(() => {
  let gastosFiltrados = [...props.viaje.gastos];

  // Aplicar filtro por pagador si está seleccionado
  if (filtroPagador.value) {
    gastosFiltrados = gastosFiltrados.filter(
      (gasto) => gasto.pagadoPorId === filtroPagador.value
    );
  }

  return gastosFiltrados.sort(
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

// Métodos
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

// Funciones para filtros
const limpiarFiltros = (): void => {
  filtroPagador.value = "";
};

// Funciones para edición
const editarGasto = (gasto: any): void => {
  gastoEditando.value = gasto.id;
  formularioEdicion.value = {
    descripcion: gasto.descripcion,
    monto: gasto.monto,
    fechaGasto: gasto.fecha.split("T")[0], // Extraer solo la fecha
    pagadoPorId: gasto.pagadoPorId,
    participantesDeudaIds: [...gasto.participantesDeudaIds],
  };
  mostrarModalEdicion.value = true;
};

const cerrarModalEdicion = (): void => {
  mostrarModalEdicion.value = false;
  gastoEditando.value = null;
  formularioEdicion.value = {
    descripcion: "",
    monto: 0,
    fechaGasto: "",
    pagadoPorId: "",
    participantesDeudaIds: [],
  };
};

const guardarEdicionGasto = (): void => {
  if (!gastoEditando.value) return;

  if (formularioEdicion.value.participantesDeudaIds.length === 0) {
    alert("Debes seleccionar al menos un participante que deba pagar");
    return;
  }

  const exito = editarGastoExistente(
    props.viaje.id,
    gastoEditando.value,
    formularioEdicion.value.descripcion,
    formularioEdicion.value.monto,
    formularioEdicion.value.pagadoPorId,
    formularioEdicion.value.participantesDeudaIds,
    formularioEdicion.value.fechaGasto
  );

  if (exito) {
    cerrarModalEdicion();
    emit("gastoEditado");
  }
};

const seleccionarTodosEdicion = (): void => {
  formularioEdicion.value.participantesDeudaIds = props.viaje.participantes.map(
    (p) => p.id
  );
};

const deseleccionarTodosEdicion = (): void => {
  formularioEdicion.value.participantesDeudaIds = [];
};

const obtenerNombreParticipante = (id: string): string => {
  const participante = props.viaje.participantes.find((p) => p.id === id);
  return participante?.nombre || "Desconocido";
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
