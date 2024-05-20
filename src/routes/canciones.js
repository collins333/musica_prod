'use strict'

const Interprete = require('../model/Interprete');
const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion')
const express = require('express');
const router = express.Router();

router.get('/canciones/:pagina', async (req, res) => {
	let porPagina = 50,
			pagina = req.params.pagina || 1;

	await Cancion
	.find({})
	.skip((porPagina * pagina) - porPagina)
	.limit(porPagina)
	.populate({
		path: 'del_disco',
		populate: {
			path: 'interprete',
			model: 'Interprete'
		}
	})
	.sort({del_disco: 1})
	.exec()
		.then(canciones => {
			Cancion.countDocuments()
				.then(cuenta => {
					res.render('canciones', {
						canciones,
						title: 'índice de canciones',
						current: pagina,
						paginas: Math.ceil((cuenta / porPagina))
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

router.get('/verCancion/:id', async (req, res) => {
	let id = req.params.id;

	await Cancion
		.findById(id)
		.populate({
			path: 'del_disco',
			populate: {
				path: 'interprete',
				model: 'Interprete'
			}
		})
		.exec()
			.then(cancion => {
				res.render('verCancion', {
						title: 'información de la canción',
						cancion
					});
			})
			.catch(err => {
				console.error('Error:', err)
			})
});

module.exports = router;