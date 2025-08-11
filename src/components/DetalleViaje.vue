<template>
  <div class="space-y-8">
    <!-- Header del Viaje -->
    <div class="card">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ viaje.nombre }}</h2>
      <p class="text-gray-600">
        Creado el {{ formatearFecha(viaje.fechaCreacion) }}
      </p>
    </div>

    <!-- Tabs de Navegación -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="tabActiva = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            tabActiva === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ tab.nombre }}
        </button>
      </nav>
    </div>

    <!-- Contenido de Tabs -->
    <div>
      <!-- Tab Resumen -->
      <div v-show="tabActiva === 'resumen'">
        <ResumenViaje :viaje="viaje" :resumen="resumen" />
      </div>

      <!-- Tab Participantes -->
      <div v-show="tabActiva === 'participantes'">
        <GestionParticipantes
          :viaje="viaje"
          @participante-agregado="actualizarViaje"
          @participante-eliminado="actualizarViaje"
        />
      </div>

      <!-- Tab Gastos -->
      <div v-show="tabActiva === 'gastos'">
        <GestionGastos
          :viaje="viaje"
          @gasto-agregado="actualizarViaje"
          @gasto-eliminado="actualizarViaje"
        />
      </div>

      <!-- Tab Balances -->
      <div v-show="tabActiva === 'balances'">
        <BalancesViaje :viaje="viaje" :resumen="resumen" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BalancesViaje from "@/components/BalancesViaje.vue";
import GestionGastos from "@/components/GestionGastos.vue";
import GestionParticipantes from "@/components/GestionParticipantes.vue";
import ResumenViaje from "@/components/ResumenViaje.vue";
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";
import { computed, ref, watch } from "vue";

// Props
const props = defineProps<{
  viaje: Viaje;
}>();

// Emits
const emit = defineEmits<{
  viajeActualizado: [];
}>();

// Composables
const { calcularResumenViaje } = useStorage();

// Estado reactivo
const tabActiva = ref("resumen");

const tabs = [
  { id: "resumen", nombre: "📊 Resumen" },
  { id: "participantes", nombre: "👥 Participantes" },
  { id: "gastos", nombre: "💸 Gastos" },
  { id: "balances", nombre: "⚖️ Balances" },
];

// Computed
const resumen = computed(() => {
  return calcularResumenViaje(props.viaje.id);
});

// Métodos
const actualizarViaje = (): void => {
  emit("viajeActualizado");
};

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Watchers para cambiar automáticamente de tab cuando sea necesario
watch(
  () => props.viaje.participantes.length,
  (newVal) => {
    if (newVal === 0 && tabActiva.value !== "participantes") {
      tabActiva.value = "participantes";
    }
  }
);
</script>
