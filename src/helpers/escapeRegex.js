'use strict';

const escapeRegex = (texto) => {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = escapeRegex;