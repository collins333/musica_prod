'use strict';

const Interprete = require('../model/Interprete');
const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion');

exports.home = (req, res) => {
    res.render('index', {
        title: 'mi coleccion de música'
    });
};

// LISTAR CANTANTES
exports.listarCantantes = async (req, res) => {
    try {
        let porPagina = 10;
        let pagina = req.params.pagina || 1;

        const interpretes = await Interprete
            .find({})
            .sort({nombre: 1})
            .skip((porPagina * pagina) - porPagina)
            .limit(porPagina)
            .populate('discos');
            //.populate('canciones');

        const interpretesConTotales = await Promise.all(
            interpretes.map(async interprete => {
                const totalCanciones = await Cancion.countDocuments({
                    del_interprete: interprete._id
                });

                return {
                    ...interprete.toObject(),
                    totalCanciones
                };
            })
        );

        const cuenta = await Interprete.countDocuments();

        res.render('cantantes', {
            interpretes: interpretesConTotales,
            title: 'índice de cantantes',
            current: pagina,
            paginas: Math.ceil(cuenta / porPagina)
        });
    } catch (err) {
        console.error('Error:', err);
    }
};

// VER CANTANTE
exports.verCantante = async (req, res) => {
    try {
        const id = req.params.id;

        const interprete = await Interprete
            .findById(id)
            //.populate('canciones')
            .populate('discos');

        const canciones = await Cancion.find({
            del_interprete: id
        }).sort({
            num_cancion: 1
        });

        res.render('verCantante', {
            title: 'toda la información del cantante',
            interprete,
            canciones
        });

    } catch (err) {
        console.error('Error:', err);
    }
};

// IR FORMULARIO CREAR CANTANTE
exports.formNuevoInterprete = (req, res) => {
    res.render('nuevoInterprete', {
        title: 'Añadir cantante'
    })
}

// CREAR CANTANTE
exports.crearInterprete = async (req, res) => {
    try {
        const interprete = new Interprete(req.body);

        await interprete.save();

        res.redirect('/cantantes/1');

    } catch (err) {
        console.error('Error:', err)
    }
}

// IR FORMULARIO EDITAR CANTANTE
exports.formEditarInterprete = async (req, res) => {
    try {
        const id = req.params.id;
    
        const interprete = await Interprete.findById(id);

        res.render('editCantante', {
            title: 'Editar intérprete',
            interprete
        });

    } catch (err) {
        console.error('Error:', err)
    }
}

// EDITAR CANTANTE
exports.editarInterprete = async (req, res) => {
    try {
        const id = req.params.id;

        await Interprete.findByIdAndUpdate(id, req.body);

        res.redirect('/cantantes/1');

    } catch (err) {
        console.error('Error:', err)
    }
}

// ELIMINAR CANTANTE
exports.eliminarInterprete = async (req, res) => {
    try {
        const id = req.params.id;

        // buscar discos del interprete
        const discos = await Disco.find({
           interprete: id 
        });

        // ids discos
        const discosIds = discos.map(d => d._id);

        // borrar canciones
        await Cancion.deleteMany({
            del_disco : { $in: discosIds}
        });

        // borrar discos
        await Disco.deleteMany({
            interprete: id
        });

        // borrar intérprete
        await Interprete.findByIdAndDelete(id);

        res.redirect('/cantantes/1');

    } catch (err) {
        console.error('Error:', err);

        res.status(500).send('Error eliminando intérprete');
    }
}

// BUSCADOR
exports.buscar = async (req, res) => {
    try {
        const texto = req.query.buscar.trim();
        
        if (!texto) {
            return res.render('noEncontrado', {
                title: 'buscador de cantantes y discos'
            });
        }

        const interpretes = await Interprete
            .find({
                nombre: { $regex: texto, $options: 'i' }
            })
            .sort({nombre: 1});

        const discos = await Disco
            .find({
                titulo: { $regex: texto, $options: 'i' }
            })
            .sort({titulo: 1});

        const canciones = await Cancion
            .find({
                tit_cancion: { $regex: texto, $options: 'i'}
            })
            .populate('del_disco')
            .sort({tit_cancion: 1});

        if (interpretes.length === 0 && discos.length === 0 && canciones.length === 0){
            return res.render('noEncontrado', {
                title: 'buscador de cantantes, discos y canciones'
            });
        }

        res.render('buscar', {
            title: 'buscador de cantantes, discos y canciones',
            query: texto,
            interpretes,
            discos,
            canciones
        });

    } catch (err) {
        console.error('Error:', err)
    }
};