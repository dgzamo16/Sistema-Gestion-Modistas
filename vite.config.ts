// Importamos la función que nos permite configurar Vite.
import { defineConfig } from 'vite'

// Plugin que le da soporte a Vite para entender archivos React (.tsx).
import react from '@vitejs/plugin-react'

// Plugin que conecta Tailwind CSS directamente con Vite (forma actual en Tailwind v4).
import tailwindcss from '@tailwindcss/vite'

// defineConfig recibe un objeto con la configuración de Vite.
// "plugins" es la lista de herramientas que Vite va a usar al construir el proyecto.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})