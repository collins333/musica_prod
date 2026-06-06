'use strict';

module.exports = (err, req, res, next) => {
  // siempre dejamos el rastro del error completo en la consola/logs del servidor
  console.error('[Manejador Global de Errores]:', err);

  // evaluamos si estamos en producción (Render) o desarrollo (local)
  const esProduccion = process.env.NODE_ENV === 'production';

  // si estamos en local, mostramos el texto real del error. Si no, el mensaje genérico y seguro
  const mensajeError = esProduccion ? 'Ha ocurrido un error inesperado en nuestra colección.' : err.message || err.toString();

  // si la base de datos lanza un fallo de ID mal formada (CastError), lo hacemos más amigable
  let estado = 500;
  let titulo = 'Error Interno';

  if (err.name === 'CastError') {
    estado = 400;
    titulo = 'Identificador Inválido';
  }

  // renderizamos su vista 'error.ejs' pasando los datos dinámicos de forma segura
  res.status(estado).render("error", {
    title: titulo,
    mensaje: mensajeError
  });
};