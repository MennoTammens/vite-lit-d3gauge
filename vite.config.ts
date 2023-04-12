//import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default {
  plugins: [
    legacy({
      targets: [
       'defaults',
       'not IE 11',
      ]
    })
  ]
}
