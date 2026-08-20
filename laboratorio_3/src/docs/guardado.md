RF-03: Guardado asíncrono
#	Criterio
CA-RF03-01	Dado que he enviado una solicitud, mientras el sistema guarda los datos, entonces la interfaz muestra un spinner o barra de progreso y no se congela (puedo navegar a otras secciones).
CA-RF03-02	Dado que el guardado asíncrono se completó exitosamente, entonces el sistema muestra un mensaje de confirmación: "Solicitud guardada correctamente" y me proporciona un código único de seguimiento.
CA-RF03-03	Dado que el guardado asíncrono falló por un error de red, entonces el sistema muestra un mensaje: "No se pudo guardar la solicitud. Por favor, intentá de nuevo más tarde" y permite reintentar.