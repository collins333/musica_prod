'use strict'

const express = require('express');
const router = express.Router();

const cancionesController = require('../controllers/canciones.controller')

const isAuth = require('../middlewares/isAuth');

// ELIMINAR CANCION
router.delete('/deleteCancion/:id', isAuth, cancionesController.eliminarCancion);
// FORMULARIO EDITAR CANCION
router.get('/editCancion/:id', isAuth, cancionesController.formEditarCancion);
// EDITAR CANCION
router.put('/editCancion/:id', isAuth, cancionesController.editarCancion);
// FORMULARIO CANCION NUEVA
router.get('/canciones/nueva', isAuth, cancionesController.formNuevaCancion);
// CREAR CANCION NUEVA
router.post('/canciones',isAuth, cancionesController.crearCancion);
// VER CANCION
router.get('/verCancion/:id', cancionesController.verCancion);
// VER CANCIONES
router.get('/canciones/:pagina', cancionesController.listarCanciones);

module.exports = router;