import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// No GitHub Pages o site mora em https://USUARIO.github.io/NOME-DO-REPOSITORIO/,
// então o Vite precisa saber o prefixo ("base"). O workflow define VITE_BASE;
// localmente (e em hospedagens na raiz, como a Vercel) o padrão é "/".
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
