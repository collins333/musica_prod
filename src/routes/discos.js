'use strict'

const express = require('express');
const router = express.Router();

const discosController = require('../controllers/discos.controller');

const isAuth = require('../middlewares/isAuth');

// Eliminar disco
router.delete('/deleteDisco/:id', isAuth, discosController.eliminarDisco);

// Ir formulario editar disco
router.get('/editDisco/:id', isAuth, discosController.formEditarDisco);

// Editar disco
router.put('/editDisco/:id', isAuth, discosController.editarDisco);

// Ir formulario nuevo disco
router.get('/discos/nuevo', isAuth, discosController.formNuevoDisco);

// Crear disco
router.post('/discos', isAuth, discosController.crearDisco);

// Listado discos
router.get('/discos/:pagina', discosController.listarDiscos);

// Ver disco
router.get('/verDisco/:id', discosController.verDisco);

module.exports = router;