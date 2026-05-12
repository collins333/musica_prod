'use strict'

const express = require('express');
const router = express.Router();

const cancionesController = require('../controllers/canciones.controller')

// ELIMINAR CANCION
router.delete('/deleteCancion/:id', cancionesController.eliminarCancion);
// FORMULARIO EDITAR CANCION
router.get('/editCancion/:id', cancionesController.formEditarCancion);
// EDITAR CANCION
router.put('/editCancion/:id', cancionesController.editarCancion);
// FORMULARIO CANCION NUEVA
router.get('/canciones/nueva', cancionesController.formNuevaCancion);
// CREAR CANCION NUEVA
router.post('/canciones', cancionesController.crearCancion);
// VER CANCION
router.get('/verCancion/:id', cancionesController.verCancion);
// VER CANCIONES
router.get('/canciones/:pagina', cancionesController.listarCanciones);

module.exports = router;