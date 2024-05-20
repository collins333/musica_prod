'use strict'

const Interprete = require('../model/Interprete');
const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', {
			title: 'mi colección de música'
		})
})

router.get('/cantantes/:pagina', async (req, res) => {
	let porPagina = 10,
			pagina = req.params.pagina || 1;
	
	await Interprete
		.find({})
		.sort({nombre: 1})
		.skip((porPagina * pagina) - porPagina)
		.limit(porPagina)
		.populate('discos')
		.populate('canciones')
		.exec()
			.then(interpretes => {
				Interprete.countDocuments()
					.then(cuenta =>{
						res.render('cantantes', {
							interpretes,
							title: 'Indice de cantantes',
							current: pagina,
							paginas: Math.ceil(cuenta/porPagina)
						})
					})
					.catch(err =>{
						console.error('Error:', err)
					})
			})
			.catch(err => {
				console.error('Error:', err)
			})
});

router.get('/verCantante/:id', async (req, res) => {
	let id = req.params.id;

	await Interprete
		.findById(id)
		.populate('canciones')
		.populate('discos')
		.exec()
			.then(interprete => {
				res.render('verCantante', {
					title: 'toda la información del cantante',
					interprete
				})
			})
			.catch(err => {
				console.error('Error:', err)
			})
})

router.get('/buscando', async (req, res) => {
	if(req.query.buscar) {
		await Interprete
		.find({nombre: {$regex:'.*'+req.query.buscar+'.*', $options:'i'}})
		.exec()
			.then(interpretes => {
				Disco
				.find({titulo: {$regex: '.*'+req.query.buscar+'.*', $options: 'i'}})
				.exec()
					.then(discos => {
						if(interpretes.length == 0 && discos.length == 0){
							res.render('noEncontrado', {title: 'Buscador de cantantes y discos'})
						}else {
							res.render('buscar', {
								title: 'buscador de cantantes y discos',
								interpretes,
								discos
							})
						}
					})
					.catch(err => {
						console.error('Error:', err)
					})
			})
			.catch(err => {
				console.error('Error:', err)
			})
	}else{
		res.render('noEncontrado', {
			title: 'Buscador de cantantes y discos'
		})
	}
});


module.exports = router;