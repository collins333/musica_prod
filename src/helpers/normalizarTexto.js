'use strict';

const normalizarTexto = (texto = '') => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

module.exports = normalizarTexto;