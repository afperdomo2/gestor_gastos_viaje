<template>
  <div class="space-y-6">
    <!-- Resumen de Balances -->
    <div v-if="resumen && resumen.balances.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Balance Individual</h3>
      <div class="space-y-3">
        <div 
          v-for="balance in resumen.balances" 
          :key="balance.personaId"
          class="flex items-center justify-between p-4 rounded-lg"
          :class="getBalanceStyle(balance.balance)"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span class="font-semibold text-gray-700">
                {{ obtenerIniciales(balance.nombre) }}
              </span>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ balance.nombre }}</div>
              <div class="text-sm text-gray-600">
                Pagó: ${{ formatearMoneda(balance.totalPagado) }} • 
                Debe: ${{ formatearMoneda(balance.totalDeuda) }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold" :class="getBalanceTextClass(balance.balance)">
              {{ balance.balance >= 0 ? '+' : '' }}${{ formatearMoneda(Math.abs(balance.balance)) }}
            </div>
            <div class="text-sm text-gray-600">
              {{ balance.balance > 0 ? 'Le deben' : balance.balance < 0 ? 'Debe' : 'Equilibrado' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Matriz de Deudas -->
    <div v-if="resumen && resumen.deudaMatriz && viaje.participantes.length > 1" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Matriz de Deudas</h3>
      <p class="text-sm text-gray-600 mb-4">
        Las filas representan quien pagó, las columnas quien debe. Solo se muestran deudas mayores a $0.
      </p>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagador \ Deudor
              </th>
              <th 
                v-for="participante in viaje.participantes" 
                :key="participante.id"
                class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ obtenerNombreCorto(participante.nombre) }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pagador in viaje.participantes" :key="pagador.id">
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ obtenerNombreCorto(pagador.nombre) }}
              </td>
              <td 
                v-for="deudor in viaje.participantes" 
                :key="deudor.id"
                class="px-3 py-2 whitespace-nowrap text-sm text-center"
              >
                <span 
                  v-if="pagador.id !== deudor.id"
                  :class="getDeudaClass(resumen.deudaMatriz[pagador.id][deudor.id])"
                >
                  {{ formatearDeuda(resumen.deudaMatriz[pagador.id][deudor.id]) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen de Liquidación -->
    <div v-if="resumen && resumen.balances.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🧮 Resumen de Liquidación</h3>
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Personas que deben recibir dinero -->
        <div>
          <h4 class="font-medium text-green-700 mb-3">💰 Personas que deben recibir:</h4>
          <div class="space-y-2">
            <div 
              v-for="balance in acreedores" 
              :key="balance.personaId"
              class="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <span class="font-medium text-green-800">{{ balance.nombre }}</span>
              <span class="font-bold text-green-700">
                +${{ formatearMoneda(balance.balance) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Personas que deben pagar -->
        <div>
          <h4 class="font-medium text-red-700 mb-3">💳 Personas que deben pagar:</h4>
          <div class="space-y-2">
            <div 
              v-for="balance in deudores" 
              :key="balance.personaId"
              class="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <span class="font-medium text-red-800">{{ balance.nombre }}</span>
              <span class="font-bold text-red-700">
                -${{ formatearMoneda(Math.abs(balance.balance)) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Verificación de balance -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="text-sm text-blue-700">
          <p class="font-medium">
            ✅ Total a recibir: ${{ formatearMoneda(totalAcreedores) }}
          </p>
          <p class="font-medium">
            ❌ Total a pagar: ${{ formatearMoneda(totalDeudores) }}
          </p>
          <p class="font-medium">
            ⚖️ Diferencia: ${{ formatearMoneda(Math.abs(totalAcreedores - totalDeudores)) }}
            <span v-if="Math.abs(totalAcreedores - totalDeudores) < 0.01" class="text-green-600">
              ✓ Balanceado
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-if="!resumen || resumen.balances.length === 0" class="card text-center py-8">
      <div class="text-gray-500">
        <p class="text-lg mb-2">⚖️ No hay balances para mostrar</p>
        <p class="text-sm">Registra algunos gastos para ver los balances entre participantes</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Viaje, ResumenViaje } from '@/types';

// Props
const props = defineProps<{
  viaje: Viaje;
  resumen: ResumenViaje | null;
}>();

// Computed
const acreedores = computed(() => {
  if (!props.resumen) return [];
  return props.resumen.balances
    .filter(balance => balance.balance > 0)
    .sort((a, b) => b.balance - a.balance);
});

const deudores = computed(() => {
  if (!props.resumen) return [];
  return props.resumen.balances
    .filter(balance => balance.balance < 0)
    .sort((a, b) => a.balance - b.balance);
});

const totalAcreedores = computed(() => {
  return acreedores.value.reduce((total, balance) => total + balance.balance, 0);
});

const totalDeudores = computed(() => {
  return Math.abs(deudores.value.reduce((total, balance) => total + balance.balance, 0));
});

// Métodos
const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const obtenerNombreCorto = (nombre: string): string => {
  return nombre.length > 10 ? nombre.substring(0, 8) + '...' : nombre;
};

const formatearMoneda = (monto: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
};

const formatearDeuda = (monto: number): string => {
  return monto > 0 ? `$${formatearMoneda(monto)}` : '';
};

const getBalanceStyle = (balance: number): string => {
  if (balance > 0) return 'bg-green-50 border border-green-200';
  if (balance < 0) return 'bg-red-50 border border-red-200';
  return 'bg-gray-50 border border-gray-200';
};

const getBalanceTextClass = (balance: number): string => {
  if (balance > 0) return 'text-green-700';
  if (balance < 0) return 'text-red-700';
  return 'text-gray-700';
};

const getDeudaClass = (monto: number): string => {
  if (monto > 0) return 'font-medium text-red-600';
  return 'text-gray-400';
};
</script>
