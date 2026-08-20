RF-05: Clasificación automática
#	Criterio
CA-RF05-01	Dado que una solicitud tiene un puntaje ≥ 80, cuando el sistema aplica la clasificación, entonces la clasifica como "Recomendada".
CA-RF05-02	Dado que una solicitud tiene un puntaje entre 50 y 79 (inclusive), cuando el sistema aplica la clasificación, entonces la clasifica como "Revisar".
CA-RF05-03	Dado que una solicitud tiene un puntaje < 50, cuando el sistema aplica la clasificación, entonces la clasifica como "Rechazada".

RF-06: Lista de solicitudes
#	Criterio
CA-RF06-01	Dado que soy un analista autenticado, cuando accedo al panel de solicitudes, entonces el sistema muestra una tabla con las columnas: ID, Empresa, Fecha, Estado, Clasificación IA y Acciones.
CA-RF06-02	Dado que hay solicitudes en diferentes estados, cuando el analista ve la lista, entonces cada solicitud muestra su estado actual (Pendiente, En revisión, Recomendada, Revisar, Rechazada, Aprobada, Denegada).

RF-07: Detalle de solicitud
#	Criterio
CA-RF07-01	Dado que soy un analista autenticado y estoy viendo la lista de solicitudes, cuando hago clic en una solicitud, entonces el sistema muestra el detalle completo incluyendo: datos de la empresa, documentos adjuntos (con enlace de descarga), puntaje de cumplimiento, clasificación de IA y observaciones.

RF-08: Cambiar estado a "En revisión"
#	Criterio
CA-RF08-01	Dado que estoy viendo el detalle de una solicitud en estado "Pendiente", cuando hago clic en "Iniciar revisión", entonces el sistema cambia el estado a "En revisión" y muestra un mensaje de confirmación.
CA-RF08-02	Dado que estoy viendo el detalle de una solicitud que ya está "En revisión" por otro analista, cuando intento iniciar revisión, entonces el sistema muestra un mensaje: "Esta solicitud ya está siendo revisada por otro analista".

RF-09: Generar reporte de cumplimiento
#	Criterio
CA-RF09-01	Dado que he finalizado la revisión de una solicitud, cuando hago clic en "Generar reporte", entonces el sistema descarga un archivo PDF que contiene: nombre de la empresa, criterios evaluados, puntaje obtenido (0-100), clasificación (Recomendada/Revisar/Rechazada) y observaciones del analista
