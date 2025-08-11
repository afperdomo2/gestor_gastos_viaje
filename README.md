# 💰 Gestor de Gastos de Viaje

Una aplicación web moderna para gestionar y liquidar gastos compartidos en viajes entre varias personas. Desarrollada con Vue 3, TypeScript y Tailwind CSS.

## ✨ Características

- **Gestión de Viajes**: Crea y administra múltiples viajes
- **Participantes**: Agrega personas al viaje y gestiona su participación
- **Registro de Gastos**: Registra gastos detallados con información de quién pagó y quién debe
- **Cálculos Automáticos**: Calcula automáticamente deudas individuales y balances
- **Matriz de Deudas**: Visualización clara de quién le debe a quién
- **Gráficos Interactivos**: Gráficos de barras para visualizar gastos por participante
- **Responsivo**: Diseño adaptable para móviles y escritorio
- **Persistencia Local**: Todos los datos se guardan en localStorage del navegador

## 🚀 Tecnologías

- **Vue 3** con Composition API y `<script setup>`
- **TypeScript** para tipado fuerte
- **Tailwind CSS** para estilos
- **Chart.js** para gráficos
- **Vite** como bundler
- **localStorage** para persistencia de datos

## 📦 Instalación y Desarrollo

### Requisitos
- Node.js 22 o superior
- npm o yarn

### Configuración
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd gestor_gastos_viaje

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la build
npm run preview
```

## 🎯 Uso de la Aplicación

### 1. Crear un Viaje
- Haz clic en "Nuevo Viaje" en la pantalla principal
- Ingresa el nombre del viaje (ej: "Viaje a Cartagena")

### 2. Agregar Participantes
- Ve a la pestaña "Participantes"
- Agrega a todas las personas que participarán en el viaje

### 3. Registrar Gastos
- Ve a la pestaña "Gastos"
- Para cada gasto, especifica:
  - Descripción (ej: "Hotel", "Cena", "Gasolina")
  - Monto total
  - Quién pagó
  - Quiénes deben pagar (puedes seleccionar múltiples personas)

### 4. Ver Balances
- La pestaña "Resumen" muestra estadísticas generales
- La pestaña "Balances" muestra la matriz de deudas y liquidación final

## 📊 Estructura de Datos

La aplicación maneja una estructura de datos simple pero poderosa:

```typescript
interface Viaje {
  id: string;
  nombre: string;
  participantes: Participante[];
  gastos: Gasto[];
  fechaCreacion: string;
}

interface Participante {
  id: string;
  nombre: string;
}

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  pagadoPorId: string;
  participantesDeudaIds: string[];
  fecha: string;
}
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes Vue reutilizables
│   ├── DetalleViaje.vue
│   ├── ResumenViaje.vue
│   ├── GestionParticipantes.vue
│   ├── GestionGastos.vue
│   └── BalancesViaje.vue
├── composables/         # Lógica reutilizable (Composition API)
│   └── useStorage.ts
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts
├── App.vue             # Componente principal
├── main.ts             # Punto de entrada
└── style.css           # Estilos globales con Tailwind

```

## 🚀 Despliegue

### GitHub Pages
```bash
# Construir y desplegar a GitHub Pages
npm run deploy
```

### Manual
```bash
# Construir para producción
npm run build

# Los archivos estáticos estarán en la carpeta 'dist'
# Sube estos archivos a tu servidor web
```

## 💡 Características Técnicas

- **Reactivo**: Interfaz completamente reactiva con Vue 3
- **Tipado Fuerte**: TypeScript en toda la aplicación
- **Composables**: Lógica de negocio organizada en composables reutilizables
- **Validaciones**: Validaciones robustas para entradas de usuario
- **Responsive**: Funciona perfectamente en móviles y escritorio
- **Accesible**: Diseño accesible con controles keyboard-friendly

## 🔧 Personalización

Para personalizar los colores, edita el archivo `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Define tus colores personalizados aquí
      }
    }
  }
}
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue describiendo:
- Pasos para reproducir el problema
- Comportamiento esperado vs comportamiento actual
- Screenshots si es necesario
- Navegador y versión utilizada
