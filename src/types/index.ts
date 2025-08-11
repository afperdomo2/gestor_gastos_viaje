// Tipos para la aplicación de gestión de gastos de viaje

export interface Participante {
  id: string;
  nombre: string;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  pagadoPorId: string;
  participantesDeudaIds: string[];
  fecha: string;
}

export interface Viaje {
  id: string;
  nombre: string;
  participantes: Participante[];
  gastos: Gasto[];
  fechaCreacion: string;
}

export interface DeudaMatriz {
  [pagadorId: string]: {
    [deudorId: string]: number;
  };
}

export interface BalancePersona {
  personaId: string;
  nombre: string;
  totalPagado: number;
  totalDeuda: number;
  balance: number; // positivo = le deben, negativo = debe
}

export interface ResumenViaje {
  gastoTotal: number;
  participantesCount: number;
  gastosCount: number;
  deudaMatriz: DeudaMatriz;
  balances: BalancePersona[];
}
