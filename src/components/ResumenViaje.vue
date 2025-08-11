<template>
  <div class="space-y-6">
    <!-- Estadísticas Generales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="text-3xl font-bold text-primary-600">
          ${{ formatearMoneda(resumen?.gastoTotal || 0) }}
        </div>
        <div class="text-sm text-gray-600 mt-1">Gasto Total</div>
      </div>
      
      <div class="card text-center">
        <div class="text-3xl font-bold text-green-600">
          {{ resumen?.participantesCount || 0 }}
        </div>
        <div class="text-sm text-gray-600 mt-1">Participantes</div>
      </div>
      
      <div class="card text-center">
        <div class="text-3xl font-bold text-blue-600">
          {{ resumen?.gastosCount || 0 }}
        </div>
        <div class="text-sm text-gray-600 mt-1">Gastos Registrados</div>
      </div>
    </div>

    <!-- Gráfico de Gastos por Persona -->
    <div v-if="viaje.participantes.length > 0 && viaje.gastos.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Gastos por Participante</h3>
      <div class="relative">
        <canvas ref="chartCanvas" width="400" height="200"></canvas>
      </div>
    </div>

    <!-- Últimos Gastos -->
    <div v-if="viaje.gastos.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Últimos Gastos</h3>
      <div class="space-y-3">
        <div 
          v-for="gasto in ultimosGastos" 
          :key="gasto.id"
          class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <div class="font-medium text-gray-900">{{ gasto.descripcion }}</div>
            <div class="text-sm text-gray-600">
              Pagado por {{ obtenerNombreParticipante(gasto.pagadoPorId) }}
              • {{ formatearFecha(gasto.fecha) }}
            </div>
          </div>
          <div class="text-lg font-semibold text-gray-900">
            ${{ formatearMoneda(gasto.monto) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-if="viaje.participantes.length === 0" class="card text-center py-8">
      <div class="text-gray-500">
        <p class="text-lg mb-2">👥 Agrega participantes para comenzar</p>
        <p class="text-sm">Ve a la pestaña "Participantes" para agregar personas al viaje</p>
      </div>
    </div>

    <div v-else-if="viaje.gastos.length === 0" class="card text-center py-8">
      <div class="text-gray-500">
        <p class="text-lg mb-2">💸 No hay gastos registrados</p>
        <p class="text-sm">Ve a la pestaña "Gastos" para comenzar a registrar gastos del viaje</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Viaje, ResumenViaje as ResumenViajeType } from '@/types';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

// Props
const props = defineProps<{
  viaje: Viaje;
  resumen: ResumenViajeType | null;
}>();

// Referencias
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Computed
const ultimosGastos = computed(() => {
  return [...props.viaje.gastos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
});

const datosGrafico = computed(() => {
  if (!props.resumen) return null;

  const labels = props.resumen.balances.map(balance => balance.nombre);
  const gastosData = props.resumen.balances.map(balance => balance.totalPagado);
  const deudasData = props.resumen.balances.map(balance => balance.totalDeuda);

  return {
    labels,
    datasets: [
      {
        label: 'Pagado',
        data: gastosData,
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1
      },
      {
        label: 'Debe',
        data: deudasData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }
    ]
  };
});

// Métodos
const obtenerNombreParticipante = (id: string): string => {
  const participante = props.viaje.participantes.find(p => p.id === id);
  return participante?.nombre || 'Desconocido';
};

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const crearGrafico = (): void => {
  if (!chartCanvas.value || !datosGrafico.value) return;

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: datosGrafico.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = formatearMoneda(context.parsed.y);
              return `${context.dataset.label}: $${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${formatearMoneda(Number(value))}`
          }
        }
      }
    }
  });
};

// Lifecycle
onMounted(() => {
  if (datosGrafico.value) {
    crearGrafico();
  }
});

// Watchers
watch(datosGrafico, () => {
  if (datosGrafico.value) {
    crearGrafico();
  }
}, { deep: true });
</script>
