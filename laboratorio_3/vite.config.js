import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        inicio: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'src/pages/login.html'),
        empresa: resolve(import.meta.dirname, 'src/pages/dashboardEmpresa.html'),
        administrador: resolve(import.meta.dirname, 'src/pages/dashboardAdministrador.html'),
        analista: resolve(import.meta.dirname, 'src/pages/dashboardAnalista.html'),
        zonas: resolve(import.meta.dirname, 'src/pages/zonasFrancas.html'),
        solicitud: resolve(import.meta.dirname, 'src/pages/solicitud.html'),
        detalle: resolve(import.meta.dirname, 'src/pages/detalleSolicitud.html'),
        consulta: resolve(import.meta.dirname, 'src/pages/consulta.html'),
        cumplimiento: resolve(import.meta.dirname, 'src/pages/cumplimiento.html')
        ,panelAnalistaAnterior: resolve(import.meta.dirname, 'src/pages/panelDeAnalista.html')
        ,panelAdminAnterior: resolve(import.meta.dirname, 'src/pages/dashboard.html')
        ,portalAnterior: resolve(import.meta.dirname, 'src/pages/portalSolicitud.html')
      }
    }
  }
});
