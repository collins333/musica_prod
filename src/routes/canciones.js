'use strict'

const Interprete = require('../model/Interprete');
const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion')
const express = require('express');
const router = express.Router();

// router.get('/', (req, res) => {
// 	res.render('index', {
// 		title: 'mi colección de música'
// 	})
// })

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

// router.get('/addCancion', async (req, res) => {
// 	await Interprete
// 	.find({})
// 	.populate('discos')
// 	.sort({nombre: 1})
// 	.exec()
// 		.then(interpretes => {
// 			Disco
// 			.find({})
// 			.populate('interprete')
// 			.sort({interprete: 1, anyo: 1, titulo: 1})
// 			.exec()
// 				.then(discos => {
// 					res.render('addCancion', {
// 						title: 'agregar canción nueva',
// 						interpretes,
// 						discos
// 					})
// 				})
// 				.catch(err => {
// 					console.error('Error:', err)
// 				})
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// })

// router.post('/addCancion', async (req, res) => {
//   const {tit_cancion, num_cancion, dur_cancion, del_disco, del_interprete, enlace} = req.body;

// 	const cancion = await Cancion.create({tit_cancion, num_cancion, dur_cancion, del_disco, del_interprete, enlace})
// 		.then(cancion => {
// 			Disco.findById(cancion.del_disco._id)
// 			.then(disco => {
// 				disco.canciones.push(cancion)
// 				disco.save()
				
// 				res.redirect('/canciones/1')		
// 			})
// 		// })
// 			.catch(err => {
// 				console.error('Error:', err)
// 			})
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// })

// router.get('/editCancion/:id', async (req, res) => {
//   await Cancion
// 		.findById(req.params.id)
// 		.populate({
// 			path: 'del_disco',
// 			populate: {
// 				path: 'interprete',
// 				model: 'Interprete'
// 			}
// 		})
// 		.exec()
// 			.then(cancion => {
// 				Interprete
// 					.find({})
// 					.populate('discos')
// 					.sort({nombre: 1})
// 					.exec()
// 						.then(interpretes => {
// 							Disco
// 							.find({})
// 							.populate('interprete')
// 							.sort({interprete: 1, anyo: 1, titulo: 1})
// 							.exec()
// 								.then(discos => {
// 									res.render('editCancion', {
// 										title: 'Editar la canción',
// 										cancion,
// 										interpretes,
// 										discos
// 									})
// 								})
// 								.catch(err => {
// 									console.error('Error:', err)
// 								})
// 						})
// 						.catch(err => {
// 							console.error('Error:', err)
// 						})
// 			})
// 			.catch(err => {
// 				console.error('Error:', err)
// 			})
// })

// router.put('/editCancion/:id', async (req, res) => {
//   let id = req.params.id;
  
// 	await Cancion.findByIdAndUpdate(id, req.body)
// 		.then(cancion => {
// 			res.redirect('/canciones/1');
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// });

// router.delete('/deleteCancion/:id', async (req, res) => {
//   const {id} = req.params
	
// 	await Cancion.findByIdAndDelete(id)
// 		.then(cancion => {
// 			res.redirect('/canciones/1');
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// });

module.exports = router;