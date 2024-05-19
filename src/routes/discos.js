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

// router.get('/addDisco', async (req, res) => {
// 	await Interprete
// 	.find({})
// 	.populate('discos')
// 	.sort({nombre: 1})
// 	.exec()
// 		.then(interpretes => {
// 			res.render('addDisco', {
// 				title: 'agregar disco nuevo',
// 				interpretes
// 			})
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// })

// router.post('/addDisco', async (req, res) => {
//   const {titulo, caratula, anyo, info, interprete} = req.body;

// 	await Disco.create({titulo, caratula, anyo, info, interprete})
// 		.then(disco => {
// 			Interprete.findById(disco.interprete._id)
// 				.then(interprete => {
// 					interprete.discos.push(disco)
// 					interprete.save()
					
// 					res.redirect('/discos/1')		
// 				})
// 				.catch(err => {
// 					console.error('Error:', err)
// 				})
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// 	})

// router.get('/editDisco/:id', async (req, res) => {
// 	let id = req.params.id
	
//   await Disco
// 	.findById(id)
// 	.populate('canciones')
// 	.populate('interprete')
// 		.then(disco => {
// 			Interprete
// 			.find({})
// 			.populate('discos')
// 			.sort({nombre: 1})
// 			.exec()
// 				.then(interpretes => {
// 					res.render('editDisco', { 
// 						title: 'Editar el disco',
// 						disco,
// 						interpretes 
// 					})
// 				})
// 				.catch(err => {
// 					console.error('Error: ', err)
// 				})
// 		})		
// 		.catch(err => {
// 			console.error('Error: ', err)
// 		})
// })

// router.put('/editDisco/:id', async (req, res) => {
//   let id = req.params.id;
	
// 	await Disco.findByIdAndUpdate(id, req.body)
// 		.then(disco => {
// 			res.redirect('/discos/1');
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// });

// router.delete('/deleteDisco/:id', async (req, res) => {
//   const {id} = req.params

// 	await Disco.findByIdAndDelete(id)
// 		.then(disco => {
// 			res.redirect('/discos/1');
// 		})
// 		.catch(err => {
// 			console.error('Error:', err)
// 		})
// });

module.exports = router;