# Santa Night Club - Sistema de Gestión Inteligente

Este es un sistema avanzado de gestión para clubes nocturnos desarrollado con **Next.js 15**, **Tailwind CSS**, **ShadCN UI** y **Genkit AI**.

## Características Principales

- **Panel Administrativo Avanzado:** Filtros por fecha y chica, estadísticas de utilidad neta y auditoría de movimientos.
- **Registro de Consumo Inteligente:** Soporta divisiones de comisión complejas (regla de llegada tardía) asistidas por IA.
- **Gestión de Turnos:** Botones de inicio y fin de noche para el personal de garzones.
- **Panel de Chica:** Visualización transparente de ganancias y consumos personales.
- **Localización:** Interfaz totalmente en español y optimizada para ambiente nocturno (Dark Mode).

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v18.0.0 o superior)
- Una clave de API de Google AI (para las funciones de optimización de comisiones con IA).

## Instalación Local

1. **Descargar el proyecto:** Copia todos los archivos a una carpeta local.
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y añade tu clave de API:
   ```env
   GOOGLE_GENAI_API_KEY=tu_clave_aqui
   ```
4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
5. **Acceder a la app:** Abre [http://localhost:9002](http://localhost:9002) en tu navegador.

## Usuarios de Prueba

- **Admin:** usuario: `admin` / clave: `password`
- **Garzón:** usuario: `waiter1` / clave: `password`
- **Chica (Acceso por código):** Lucía (`1234`) o Elena (`5678`)

## Notas de Desarrollo

El sistema utiliza `Zustand` con persistencia local (`localStorage`) para simular la base de datos. Esto significa que los datos que registres se guardarán en tu navegador actual. Para un entorno de producción real, se recomienda conectar este frontend con Firebase Firestore.
