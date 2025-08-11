<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              💰 Gestor de Gastos de Viaje
            </h1>
          </div>
          <div v-if="viaje" class="flex items-center space-x-4">
            <button @click="volverALista" class="btn-secondary">
              ← Volver a lista
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Vista Lista de Viajes -->
      <div v-if="!viaje" class="space-y-8">
        <div class="flex justify-between items-center">
          <h2 class="text-3xl font-bold text-gray-900">Mis Viajes</h2>
          <button @click="mostrarFormularioViaje = true" class="btn-primary">
            + Nuevo Viaje
          </button>
        </div>

        <!-- Formulario Nuevo Viaje -->
        <div v-if="mostrarFormularioViaje" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Crear Nuevo Viaje
          </h3>
          <form @submit.prevent="crearNuevoViaje" class="space-y-4">
            <div>
              <label
                for="nombreViaje"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Viaje
              </label>
              <input
                id="nombreViaje"
                v-model="nombreNuevoViaje"
                type="text"
                class="input-field"
                placeholder="Ej: Viaje a Cartagena"
                required
              />
            </div>
            <div class="flex space-x-3">
              <button type="submit" class="btn-primary">Crear Viaje</button>
              <button
                type="button"
                @click="cancelarCreacionViaje"
                class="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Viajes -->
        <div
          v-if="viajes.length === 0 && !mostrarFormularioViaje"
          class="text-center py-12"
        >
          <div class="text-gray-500 text-lg">
            <p class="mb-4">🧳 No tienes viajes creados aún</p>
            <p class="text-sm">
              Crea tu primer viaje para empezar a gestionar gastos compartidos
            </p>
          </div>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="viajeItem in viajes"
            :key="viajeItem.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="seleccionarViaje(viajeItem.id)"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ viajeItem.nombre }}
              </h3>
              <button
                @click.stop="
                  eliminarViajeConfirm(viajeItem.id, viajeItem.nombre)
                "
                class="text-red-500 hover:text-red-700"
                title="Eliminar viaje"
              >
                🗑️
              </button>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              <p>👥 {{ viajeItem.participantes.length }} participantes</p>
              <p>💸 {{ viajeItem.gastos.length }} gastos</p>
              <p class="text-xs text-gray-500">
                Creado: {{ formatearFecha(viajeItem.fechaCreacion) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Detalle del Viaje -->
      <div v-else>
        <DetalleViaje :viaje="viaje" @viaje-actualizado="actualizarViaje" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@/composables/useStorage";
import type { Viaje } from "@/types";
import DetalleViaje from "@/components/DetalleViaje.vue";

const { viajes, crearViaje, obtenerViaje, eliminarViaje } = useStorage();

// Estado reactivo
const viaje = ref<Viaje | null>(null);
const mostrarFormularioViaje = ref(false);
const nombreNuevoViaje = ref("");

// Métodos
const crearNuevoViaje = (): void => {
  if (nombreNuevoViaje.value.trim()) {
    const nuevoViaje = crearViaje(nombreNuevoViaje.value);
    nombreNuevoViaje.value = "";
    mostrarFormularioViaje.value = false;
    seleccionarViaje(nuevoViaje.id);
  }
};

const cancelarCreacionViaje = (): void => {
  nombreNuevoViaje.value = "";
  mostrarFormularioViaje.value = false;
};

const seleccionarViaje = (id: string): void => {
  const viajeSeleccionado = obtenerViaje(id);
  if (viajeSeleccionado) {
    viaje.value = viajeSeleccionado;
  }
};

const volverALista = (): void => {
  viaje.value = null;
};

const eliminarViajeConfirm = (id: string, nombre: string): void => {
  if (
    confirm(
      `¿Estás seguro de que quieres eliminar el viaje "${nombre}"? Esta acción no se puede deshacer.`
    )
  ) {
    eliminarViaje(id);
  }
};

const actualizarViaje = (): void => {
  if (viaje.value) {
    const viajeActualizado = obtenerViaje(viaje.value.id);
    if (viajeActualizado) {
      viaje.value = viajeActualizado;
    }
  }
};

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
