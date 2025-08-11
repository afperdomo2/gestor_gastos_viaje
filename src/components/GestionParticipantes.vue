<template>
  <div class="space-y-6">
    <!-- Formulario Agregar Participante -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Agregar Participante
      </h3>
      <form @submit.prevent="agregarNuevoParticipante" class="flex gap-3">
        <div class="flex-1">
          <input
            v-model="nombreParticipante"
            type="text"
            class="input-field"
            placeholder="Nombre del participante"
            required
          />
        </div>
        <button type="submit" class="btn-primary">Agregar</button>
      </form>
    </div>

    <!-- Lista de Participantes -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Participantes ({{ viaje.participantes.length }})
        </h3>
      </div>

      <div
        v-if="viaje.participantes.length === 0"
        class="text-center py-8 text-gray-500"
      >
        <p class="text-lg mb-2">👥 No hay participantes aún</p>
        <p class="text-sm">
          Agrega al menos una persona para comenzar a registrar gastos
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="participante in viaje.participantes"
          :key="participante.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="obtenerEstiloCirculo(participante.id)"
            >
              <span class="font-semibold text-white">
                {{ obtenerIniciales(participante.nombre) }}
              </span>
            </div>
            <div>
              <div class="font-medium text-gray-900">
                {{ participante.nombre }}
              </div>
              <div class="text-sm text-gray-600">
                {{ obtenerEstadisticasParticipante(participante.id) }}
              </div>
            </div>
          </div>

          <button
            @click="
              eliminarParticipanteConfirm(participante.id, participante.nombre)
            "
            class="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
            title="Eliminar participante"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Información de Ayuda -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <span class="text-blue-400 text-xl">ℹ️</span>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">
            Consejos sobre participantes
          </h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>
                Puedes agregar o eliminar participantes en cualquier momento
              </li>
              <li>
                No se puede eliminar un participante que tenga gastos asociados
              </li>
              <li>
                Los nombres de los participantes aparecerán en los formularios
                de gastos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";

// Props
const props = defineProps<{
  viaje: Viaje;
}>();

// Emits
const emit = defineEmits<{
  participanteAgregado: [];
  participanteEliminado: [];
}>();

// Composables
const { agregarParticipante, eliminarParticipante, obtenerColorParticipante } = useStorage();

// Estado reactivo
const nombreParticipante = ref("");

// Métodos
const agregarNuevoParticipante = (): void => {
  if (nombreParticipante.value.trim()) {
    // Verificar que no exista un participante con el mismo nombre
    const nombreExiste = props.viaje.participantes.some(
      (p) =>
        p.nombre.toLowerCase().trim() ===
        nombreParticipante.value.toLowerCase().trim()
    );

    if (nombreExiste) {
      alert("Ya existe un participante con ese nombre");
      return;
    }

    const participante = agregarParticipante(
      props.viaje.id,
      nombreParticipante.value
    );
    if (participante) {
      nombreParticipante.value = "";
      emit("participanteAgregado");
    }
  }
};

const eliminarParticipanteConfirm = (id: string, nombre: string): void => {
  if (
    confirm(
      `¿Estás seguro de que quieres eliminar a "${nombre}" del viaje? Esta acción no se puede deshacer.`
    )
  ) {
    try {
      eliminarParticipante(props.viaje.id, id);
      emit("participanteEliminado");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al eliminar participante"
      );
    }
  }
};

const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(" ")
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const obtenerEstiloCirculo = (participanteId: string): { backgroundColor: string } => {
  return {
    backgroundColor: obtenerColorParticipante(participanteId)
  };
};

const obtenerEstadisticasParticipante = (participanteId: string): string => {
  const gastosComoDeudor = props.viaje.gastos.filter((gasto) =>
    gasto.participantesDeudaIds.includes(participanteId)
  ).length;

  const gastosComoPagador = props.viaje.gastos.filter(
    (gasto) => gasto.pagadoPorId === participanteId
  ).length;

  if (gastosComoDeudor === 0 && gastosComoPagador === 0) {
    return "Sin gastos registrados";
  }

  const partes = [];
  if (gastosComoPagador > 0) {
    partes.push(
      `${gastosComoPagador} pago${gastosComoPagador !== 1 ? "s" : ""}`
    );
  }
  if (gastosComoDeudor > 0) {
    partes.push(
      `${gastosComoDeudor} deuda${gastosComoDeudor !== 1 ? "s" : ""}`
    );
  }

  return partes.join(" • ");
};
</script>
