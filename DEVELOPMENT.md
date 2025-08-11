# Comandos de Desarrollo

## Instalación inicial
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```

## Build para producción
```bash
npm run build
```

## Preview de la build
```bash
npm run preview
```

## Despliegue a GitHub Pages
```bash
npm run deploy
```

## Estructura del proyecto

- `src/App.vue` - Componente principal de la aplicación
- `src/components/` - Componentes Vue reutilizables
- `src/composables/` - Lógica de negocio reutilizable
- `src/types/` - Definiciones de tipos TypeScript
- `src/style.css` - Estilos globales con Tailwind CSS

## Notas de desarrollo

- La aplicación usa localStorage para persistir los datos
- Los tipos TypeScript están definidos en `src/types/index.ts`
- La lógica de almacenamiento está en `src/composables/useStorage.ts`
- Los componentes están organizados por funcionalidad

## URLs de desarrollo

- Local: http://localhost:5173/gestor_gastos_viaje/
- Build preview: http://localhost:4173/gestor_gastos_viaje/
