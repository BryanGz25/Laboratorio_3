RF-09: Generar reporte de cumplimiento
#	Criterio
CA-RF09-01	Dado que he finalizado la revisión de una solicitud, cuando hago clic en "Generar reporte", entonces el sistema descarga un archivo PDF que contiene: nombre de la empresa, criterios evaluados, puntaje obtenido (0-100), clasificación (Recomendada/Revisar/Rechazada) y observaciones del analista.

RF-10: Agregar observaciones
#	Criterio
CA-RF10-01	Dado que estoy en el detalle de una solicitud, cuando escribo una observación en el campo de texto y hago clic en "Guardar observación", entonces el sistema agrega la observación al expediente y la muestra en la sección de observaciones.
CA-RF10-02	Dado que estoy agregando una observación, cuando dejo el campo vacío y hago clic en "Guardar", entonces el sistema muestra un mensaje: "La observación no puede estar vacía".
RF-11: Manejo de errores
#	Criterio
CA-RF11-01	Dado que ocurre un error de red durante una operación, cuando el sistema detecta el error, entonces muestra un mensaje claro y no técnico: "No se pudo completar la operación. Por favor, verificá tu conexión e intentá de nuevo."
CA-RF11-02	Dado que el usuario ingresa datos inválidos en un formulario, cuando el sistema valida los datos, entonces muestra un mensaje específico indicando cuál campo es inválido y por qué.
RF-12: Confirmar/modificar/rechazar clasificación IA
#	Criterio
CA-RF12-01	Dado que estoy revisando una solicitud con clasificación de IA, cuando hago clic en "Confirmar clasificación", entonces el sistema actualiza la clasificación final al valor sugerido por la IA y registra mi decisión en el historial.
CA-RF12-02	Dado que estoy revisando una solicitud con clasificación de IA, cuando selecciono una clasificación diferente y hago clic en "Modificar clasificación", entonces el sistema actualiza la clasificación final al valor que seleccioné y registra mi decisión en el historial.
CA-RF12-03	Dado que estoy revisando una solicitud con clasificación de IA, cuando hago clic en "Rechazar clasificación", entonces el sistema me solicita una justificación y, al confirmarla, marca la solicitud como "Pendiente de reclasificación".
RF-13: Clasificación con Promise.all
#	Criterio
CA-RF13-01	Dado que se inicia la clasificación de una solicitud, cuando el sistema evalúa los criterios de admisión, entonces utiliza Promise.all para ejecutar todas las evaluaciones en paralelo.
CA-RF13-02	Dado que una de las evaluaciones paralelas falla, cuando Promise.all detecta el error, entonces el sistema maneja el error con un bloque catch, muestra un mensaje de error y no bloquea las demás evaluaciones.
RF-14: Chatbot
#	Criterio
CA-RF14-01	Dado que estoy en el formulario de solicitud, cuando hago clic en el ícono del chatbot, entonces se abre una ventana de chat en la esquina inferior derecha de la pantalla.
CA-RF14-02	Dado que el chatbot está abierto, cuando escribo una pregunta sobre requisitos o documentos, entonces el chatbot responde con información relevante basada en una base de conocimiento predefinida.
RF-15: Historial de cambios
#	Criterio
CA-RF15-01	Dado que se ha realizado un cambio de estado en una solicitud, cuando consulto el historial de la solicitud, entonces el sistema muestra una lista cronológica con: fecha y hora del cambio, usuario que lo realizó, estado anterior y estado nuevo.
RF-16: Consulta de estado por código único
#	Criterio
CA-RF16-01	Dado que soy una empresa solicitante, cuando ingreso mi código único de solicitud en la página de consulta pública, entonces el sistema muestra el estado actual de mi solicitud y el historial de cambios de estado.
CA-RF16-02	Dado que ingreso un código inválido o inexistente, cuando hago clic en "Consultar", entonces el sistema muestra un mensaje: "No se encontró ninguna solicitud con ese código. Verificá el código e intentá de nuevo."
RF-17: Administrar múltiples zonas francas
#	Criterio
CA-RF17-01	Dado que soy un administrador, cuando accedo al panel de zonas francas, entonces el sistema muestra una lista de todas las zonas francas registradas con sus criterios de admisión.
CA-RF17-02	Dado que estoy configurando una zona franca, cuando modifico sus criterios de admisión, entonces el sistema aplica los nuevos criterios solo a las solicitudes nuevas de esa zona franca.
RF-18: Exportar datos a CSV
#	Criterio
CA-RF18-01	Dado que soy un analista autenticado, cuando hago clic en "Exportar CSV", entonces el sistema descarga un archivo CSV con los datos de todas las solicitudes (ID, empresa, fecha, estado, clasificación, puntaje).