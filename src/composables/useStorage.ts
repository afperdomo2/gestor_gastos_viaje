import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import type {
  Viaje,
  Participante,
  Gasto,
  DeudaMatriz,
  BalancePersona,
  ResumenViaje,
} from "@/types";

const STORAGE_KEY = "gestor-gastos-viaje";

// Estado reactivo global
const viajes = ref<Viaje[]>([]);

export function useStorage() {
  // Cargar datos desde localStorage
  const cargarDatos = (): void => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        viajes.value = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      viajes.value = [];
    }
  };

  // Guardar datos en localStorage
  const guardarDatos = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viajes.value));
    } catch (error) {
      console.error("Error al guardar datos:", error);
    }
  };

  // Crear un nuevo viaje
  const crearViaje = (nombre: string): Viaje => {
    const nuevoViaje: Viaje = {
      id: uuidv4(),
      nombre: nombre.trim(),
      participantes: [],
      gastos: [],
      fechaCreacion: new Date().toISOString(),
    };

    viajes.value.push(nuevoViaje);
    guardarDatos();
    return nuevoViaje;
  };

  // Obtener un viaje por ID
  const obtenerViaje = (id: string): Viaje | undefined => {
    return viajes.value.find((viaje) => viaje.id === id);
  };

  // Eliminar un viaje
  const eliminarViaje = (id: string): void => {
    const index = viajes.value.findIndex((viaje) => viaje.id === id);
    if (index !== -1) {
      viajes.value.splice(index, 1);
      guardarDatos();
    }
  };

  // Agregar participante a un viaje
  const agregarParticipante = (
    viajeId: string,
    nombre: string
  ): Participante | null => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return null;

    const nuevoParticipante: Participante = {
      id: uuidv4(),
      nombre: nombre.trim(),
    };

    viaje.participantes.push(nuevoParticipante);
    guardarDatos();
    return nuevoParticipante;
  };

  // Eliminar participante de un viaje
  const eliminarParticipante = (
    viajeId: string,
    participanteId: string
  ): void => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return;

    // Verificar que el participante no tenga gastos asociados
    const tieneGastos = viaje.gastos.some(
      (gasto) =>
        gasto.pagadoPorId === participanteId ||
        gasto.participantesDeudaIds.includes(participanteId)
    );

    if (tieneGastos) {
      throw new Error(
        "No se puede eliminar un participante que tiene gastos asociados"
      );
    }

    const index = viaje.participantes.findIndex((p) => p.id === participanteId);
    if (index !== -1) {
      viaje.participantes.splice(index, 1);
      guardarDatos();
    }
  };

  // Agregar gasto a un viaje
  const agregarGasto = (
    viajeId: string,
    descripcion: string,
    monto: number,
    pagadoPorId: string,
    participantesDeudaIds: string[],
    fechaGasto?: string
  ): Gasto | null => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return null;

    const nuevoGasto: Gasto = {
      id: uuidv4(),
      descripcion: descripcion.trim(),
      monto: Math.round(monto * 100) / 100, // Redondear a 2 decimales
      pagadoPorId,
      participantesDeudaIds: [...participantesDeudaIds],
      fecha: fechaGasto
        ? new Date(fechaGasto + "T12:00:00").toISOString()
        : new Date().toISOString(),
    };

    viaje.gastos.push(nuevoGasto);
    guardarDatos();
    return nuevoGasto;
  };

  // Eliminar gasto de un viaje
  const eliminarGasto = (viajeId: string, gastoId: string): void => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return;

    const index = viaje.gastos.findIndex((g) => g.id === gastoId);
    if (index !== -1) {
      viaje.gastos.splice(index, 1);
      guardarDatos();
    }
  };

  // Editar gasto existente
  const editarGastoExistente = (
    viajeId: string,
    gastoId: string,
    descripcion: string,
    monto: number,
    pagadoPorId: string,
    participantesDeudaIds: string[],
    fechaGasto: string
  ): boolean => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return false;

    const index = viaje.gastos.findIndex((g) => g.id === gastoId);
    if (index === -1) return false;

    // Actualizar el gasto existente
    viaje.gastos[index] = {
      ...viaje.gastos[index],
      descripcion: descripcion.trim(),
      monto: Math.round(monto * 100) / 100, // Redondear a 2 decimales
      pagadoPorId,
      participantesDeudaIds: [...participantesDeudaIds],
      fecha: new Date(fechaGasto + "T12:00:00").toISOString(),
    };

    guardarDatos();
    return true;
  };

  // Calcular resumen del viaje
  const calcularResumenViaje = (viajeId: string): ResumenViaje | null => {
    const viaje = obtenerViaje(viajeId);
    if (!viaje) return null;

    const gastoTotal = viaje.gastos.reduce(
      (total, gasto) => total + gasto.monto,
      0
    );

    // Crear matriz de deudas
    const deudaMatriz: DeudaMatriz = {};

    // Inicializar matriz
    viaje.participantes.forEach((pagador) => {
      deudaMatriz[pagador.id] = {};
      viaje.participantes.forEach((deudor) => {
        deudaMatriz[pagador.id][deudor.id] = 0;
      });
    });

    // Calcular deudas por cada gasto
    viaje.gastos.forEach((gasto) => {
      if (gasto.participantesDeudaIds.length === 0) return;

      const montoPorPersona = gasto.monto / gasto.participantesDeudaIds.length;

      gasto.participantesDeudaIds.forEach((deudorId) => {
        if (deudorId !== gasto.pagadoPorId) {
          deudaMatriz[gasto.pagadoPorId][deudorId] += montoPorPersona;
        }
      });
    });

    // Calcular balances individuales
    const balances: BalancePersona[] = viaje.participantes.map(
      (participante) => {
        const totalPagado = viaje.gastos
          .filter((gasto) => gasto.pagadoPorId === participante.id)
          .reduce((total, gasto) => total + gasto.monto, 0);

        const totalDeuda = viaje.gastos
          .filter((gasto) =>
            gasto.participantesDeudaIds.includes(participante.id)
          )
          .reduce(
            (total, gasto) =>
              total + gasto.monto / gasto.participantesDeudaIds.length,
            0
          );

        return {
          personaId: participante.id,
          nombre: participante.nombre,
          totalPagado: Math.round(totalPagado * 100) / 100,
          totalDeuda: Math.round(totalDeuda * 100) / 100,
          balance: Math.round((totalPagado - totalDeuda) * 100) / 100,
        };
      }
    );

    return {
      gastoTotal: Math.round(gastoTotal * 100) / 100,
      participantesCount: viaje.participantes.length,
      gastosCount: viaje.gastos.length,
      deudaMatriz,
      balances,
    };
  };

  // Computed para lista de viajes ordenada por fecha
  const viajesOrdenados = computed(() => {
    return [...viajes.value].sort(
      (a, b) =>
        new Date(b.fechaCreacion).getTime() -
        new Date(a.fechaCreacion).getTime()
    );
  });

  // Inicializar datos al cargar el composable
  cargarDatos();

  // Función utilitaria para obtener color consistente de participante
  const obtenerColorParticipante = (participanteId: string): string => {
    const colores = [
      "#EF4444", // red-500
      "#F59E0B", // amber-500
      "#10B981", // emerald-500
      "#3B82F6", // blue-500
      "#8B5CF6", // violet-500
      "#EC4899", // pink-500
      "#06B6D4", // cyan-500
      "#84CC16", // lime-500
      "#F97316", // orange-500
      "#6366F1", // indigo-500
      "#14B8A6", // teal-500
      "#EAB308", // yellow-500
    ];

    // Usar el ID para obtener un índice consistente
    let hash = 0;
    for (let i = 0; i < participanteId.length; i++) {
      hash = participanteId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colores.length;

    return colores[index];
  };

  return {
    viajes: viajesOrdenados,
    cargarDatos,
    crearViaje,
    obtenerViaje,
    eliminarViaje,
    agregarParticipante,
    eliminarParticipante,
    agregarGasto,
    eliminarGasto,
    editarGastoExistente,
    calcularResumenViaje,
    obtenerColorParticipante,
  };
}
