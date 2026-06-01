'use strict';

const construirQuery = require('./contexto');

const obtenerContexto = (req) => {
  const contexto = {
    letra: req.query.letra || null,
    paginaCantantes: parseInt(req.query.paginaCantantes) || 1,
    paginaDiscos: parseInt(req.query.paginaDiscos) || 1,
    paginaCanciones: parseInt(req.query.paginaCanciones) || 1
  };
  contexto.query = construirQuery(contexto);
  return contexto;
};

module.exports = obtenerContexto;