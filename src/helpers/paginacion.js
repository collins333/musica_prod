"use strict";

const Interprete = require("../model/Interprete");

const obtenerSkip = (pagina, porPagina) => {
  return (pagina - 1) * porPagina;
};

const obtenerPaginaInterprete = async (interpreteID, letra, porPagina) => {
  // intérpretes de esa letra
  const interpretesLetra = await Interprete
    .find({
      nombre: {
      $regex: "^" + letra,
      $options: "i",
      },
    })
    .sort({ nombre: 1 })
    .lean();

  // posición del intérprete
  const posicion = interpretesLetra.findIndex(
    (i) => i._id.toString() === interpreteID.toString(),
  );

  // página
  const pagina = Math.ceil((posicion + 1) / porPagina);

  return pagina;
};

module.exports = {
  obtenerPaginaInterprete,
  obtenerSkip
}
