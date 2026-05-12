'use strict';

const express = require('express');
const router = express.Router();

const cantantesController = require('../controllers/cantantes.controller');

// Eliminar cantante
router.delete('/deleteCantante/:id', cantantesController.eliminarInterprete);

// Formulario editar cantante
router.get('/editCantante/:id', cantantesController.formEditarInterprete)

// Editar cantante
router.put('/editCantante/:id', cantantesController.editarInterprete)

// Formulario intérprete nuevo
router.get('/cantantes/nuevo', cantantesController.formNuevoInterprete);

// Crear intérprete
router.post('/cantantes', cantantesController.crearInterprete);

// Home
router.get('/', cantantesController.home);

// Listado cantantes
router.get('/cantantes/:pagina', cantantesController.listarCantantes);

// Ver cantante
router.get('/verCantante/:id', cantantesController.verCantante);

// Buscador
router.get('/buscando', cantantesController.buscar);

module.exports = router;