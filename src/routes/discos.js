'use strict'

const express = require('express');
const router = express.Router();

const discosController = require('../controllers/discos.controller');

// Eliminar disco
router.delete('/deleteDisco/:id', discosController.eliminarDisco);

// Ir formulario editar disco
router.get('/editDisco/:id', discosController.formEditarDisco);

// Editar disco
router.put('/editDisco/:id', discosController.editarDisco);

// Ir formulario nuevo disco
router.get('/discos/nuevo', discosController.formNuevoDisco);

// Crear disco
router.post('/discos', discosController.crearDisco);

// Listado discos
router.get('/discos/:pagina', discosController.listarDiscos);

// Ver disco
router.get('/verDisco/:id', discosController.verDisco);

module.exports = router;