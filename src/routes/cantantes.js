'use strict';

const express = require('express');
const router = express.Router();

const cantantesController = require('../controllers/cantantes.controller');

const isAuth = require('../middlewares/isAuth')

// Eliminar cantante
router.delete('/deleteCantante/:id', isAuth, cantantesController.eliminarInterprete);

// Formulario editar cantante
router.get('/editCantante/:id', isAuth, cantantesController.formEditarInterprete)

// Editar cantante
router.put('/editCantante/:id', isAuth, cantantesController.editarInterprete)

// Formulario intérprete nuevo
router.get('/cantantes/nuevo', isAuth, cantantesController.formNuevoInterprete);

// Crear intérprete
router.post('/cantantes', isAuth, cantantesController.crearInterprete);

// Home
router.get('/', cantantesController.home);

// Listado cantantes
router.get('/cantantes/:pagina', cantantesController.listarCantantes);

// Ver cantante
router.get('/verCantante/:id', cantantesController.verCantante);

// Buscador
router.get('/buscando', cantantesController.buscar);

module.exports = router;