'use strict';

const Interprete = require('../model/Interprete');

const obtenerLetrasExistentes = async () => {
  const letras = await Interprete.aggregate([
    {
      $project: {
        primeraLetra: {
          $toUpper: {
            $substr: ['$nombre', 0, 1],
          },
        },
      },
    },
    {
      $group: {
        _id: '$primeraLetra',
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  return letras.map((l) => l._id);
};

module.exports = obtenerLetrasExistentes;