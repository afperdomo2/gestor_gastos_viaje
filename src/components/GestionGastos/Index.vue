<template>
  <div class="space-y-6">
    <!-- Formulario Agregar Gasto -->
    <div class="card">
      <h3 class="mb-4 text-lg font-semibold text-gray-900">
        Registrar Nuevo Gasto
      </h3>

      <div
        v-if="viaje.participantes.length === 0"
        class="py-8 text-center text-gray-500"
      >
        <p class="mb-2 text-lg">👥 Necesitas agregar participantes primero</p>
        <p class="text-sm">
          Ve a la pestaña "Participantes" para agregar personas al viaje
        </p>
      </div>

      <form v-else @submit.prevent="agregarNuevoGasto" class="space-y-4">
        <!-- Descripción del Gasto -->
        <div>
          <label
            for="descripcion"
            class="block mb-2 text-sm font-medium text-gray-700"
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
            class="block mb-2 text-sm font-medium text-gray-700"
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
            class="block mb-2 text-sm font-medium text-gray-700"
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
            class="block mb-2 text-sm font-medium text-gray-700"
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
          <label class="block mb-2 text-sm font-medium text-gray-700">
            ¿Quiénes deben pagar por este gasto?
          </label>
          <div class="space-y-2">
            <label
              v-for="participante in viaje.participantes"
              :key="participante.id"
              class="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                v-model="formulario.participantesDeudaIds"
                type="checkbox"
                :value="participante.id"
                class="border-gray-300 rounded text-primary-600 focus:ring-primary-500"
              />
              <span class="text-gray-900">{{ participante.nombre }}</span>
            </label>
          </div>
          <div class="flex mt-2 space-x-2">
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
          class="p-4 border border-blue-200 rounded-lg bg-blue-50"
        >
          <h4 class="mb-2 text-sm font-medium text-blue-800">
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

    <!-- Componente de Gastos Registrados -->
    <TarjetaGastosRegistrados
      :viaje="viaje"
      @gasto-eliminado="emit('gastoEliminado')"
      @gasto-editado="emit('gastoAgregado')"
    />
  </div>
</template>

<script setup lang="ts">
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";
import { ref, watch } from "vue";
import TarjetaGastosRegistrados from "./TarjetaGastosRegistrados.vue";

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
const { agregarGasto } = useStorage();

// Estado reactivo
const formulario = ref({
  descripcion: "",
  monto: 0,
  fechaGasto: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
  pagadoPorId: "",
  participantesDeudaIds: [] as string[],
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

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};
</script>
