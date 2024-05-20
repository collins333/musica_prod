'use strict'

const Interprete = require('../model/Interprete');
const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion')
const express = require('express');
const router = express.Router();

router.get('/discos/:pagina', async (req, res) => {
	let porPagina = 15,
			pagina = req.params.pagina || 1;

	await Disco
	.find({})
	.skip((porPagina * pagina) - porPagina)
	.limit(porPagina)
	.populate('interprete')
	.populate('canciones')
	.sort({interprete: 1, anyo: 1, titulo: 1, })
	.exec()
		.then(discos => {
			Disco.countDocuments()
				.then(cuenta => {
					res.render('discos', {
						discos,
						title: 'índice de discos',
						current: pagina,
						paginas: Math.ceil(cuenta / porPagina)
					})
				})
				.catch(err => {
					console.error('Error:', err)
				})
		})
		.catch(err => {
			console.error('Error:', err)
		})
});

router.get('/verDisco/:id', async (req, res) => {
	let id = req.params.id;
	
	await Disco
	.findById(id)
	.populate('canciones')
	.populate('interprete')
		.then(disco => {
			res.render('verDisco', {
				title: 'toda la información del disco',
				disco
			})
		})
		.catch(err => {
			console.error('Error:', err)
		})
})

module.exports = router;