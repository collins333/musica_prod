'use strict';

const Cancion = require('../model/Cancion');
const Disco = require('../model/Disco');

// LISTAR CANCIONES
exports.listarCanciones = async (req, res) => {
    try {
        let porPagina = 50;
        let pagina = parseInt(req.params.pagina) || 1;

        const canciones = await Cancion.aggregate([
            // unir discos
            {
                $lookup: {
                    from: 'discos',
                    localField: 'del_disco',
                    foreignField: '_id',
                    as: 'del_disco'
                }
            },
            // convertir array disco -> objeto
            {
                $unwind: '$del_disco'
            },
            // unir intérprete
            {
                $lookup: {
                    from: 'interpretes',
                    localField: 'del_disco.interprete',
                    foreignField: '_id',
                    as: 'interprete'
                }
            },
            // convertir array interprete -> objeto
            {
                $unwind: '$interprete'
            },
            // ordenar
            {
                $sort: {
                    'interprete.nombre': 1,
                    'del_disco.anyo': 1,
                    'del_disco.titulo': 1,
                    num_cancion: 1
                }
            },
            // paginación
            {
                $skip: (porPagina * pagina) - porPagina
            },
            {
                $limit: porPagina
            }
        ]);


            // .skip((porPagina * pagina) - porPagina)
            // .limit(porPagina)
            // .populate({
            //     path: 'del_disco',
            //     populate: {
            //         path: 'interprete',
            //         model: 'Interprete'
            //     }
            // })
            // .sort({ del_disco: 1 });

        const cuenta = await Cancion.countDocuments();

        res.render('canciones', {
            canciones,
            title: 'índice de canciones',
            current: pagina,
            paginas: Math.ceil(cuenta / porPagina)
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

// VER CANCION
exports.verCancion = async (req, res) => {
    try {
        let id = req.params.id;

        const cancion = await Cancion.findById(id)
            .populate({
                path: 'del_disco',
                populate: {
                    path: 'interprete',
                    model: 'Interprete'
                }
            });

        res.render('verCancion', {
            title: 'información de la canción',
            cancion
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

// IR A FORMULARIO CANCION NUEVA
exports.formNuevaCancion = async (req, res) => {
    try {
        const discos = await Disco.find()
            .populate('interprete')    
            .sort({titulo: 1});
    
        res.render('nuevaCancion', {
            title: 'Añadir canción',
            discos
        });
        
    } catch(err) {
        console.error('Error:', err)
    }
};

// CREAR NUEVA CANCION
exports.crearCancion = async (req, res) => {
    try {
        // buscar disco
        const disco = await Disco.findById(req.body.del_disco);

        // crear canción
        const cancion = new Cancion({
            ...req.body,
            del_interprete: disco.interprete
        });

        await cancion.save();

        //const disco = await Disco.findById(req.body.del_disco)
        
        // añadir canción al disco
        disco.canciones.push(cancion._id);

        await disco.save();

        res.redirect('/canciones/1');

    } catch(err) {
        console.error('Error:', err)
    }
}

// IR A FORMULARIO EDITAR CANCION
exports.formEditarCancion = async (req, res) => {
    try {
        const id = req.params.id;
    
        const cancion = await Cancion.findById(id);
        const discos = await Disco.find()
            .populate('interprete')    
            .sort({titulo: 1});
    
        res.render('editCancion', {
            title: 'Editar canción',
            cancion,
            discos
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

// EDITAR CANCION
exports.editarCancion = async (req, res) => {
    try {
        const id = req.params.id;

        // canción original
        const cancionOriginal = await Cancion.findById(id);

        // nuevo disco
        const nuevoDiscoId = req.body.del_disco;
        
        // disco anterior
        const discoAnteriorId = cancionOriginal.del_disco.toString();

        // buscar nuevo disco
        const nuevoDisco = await Disco.findById(nuevoDiscoId);

        // añadir intérprete automáticamente
        req.body.del_interprete = nuevoDisco.interprete;

        // actualizar canción
        await Cancion.findByIdAndUpdate(id, req.body);

        // si se cambió de disco -> sincronizar
        if (discoAnteriorId !== nuevoDiscoId) {
            
            // quitar del disco anterior
            await Disco.findByIdAndUpdate(discoAnteriorId, {
                $pull: { canciones: id }
            });

            // añadir al nuevo disco
            await Disco.findByIdAndUpdate(nuevoDiscoId, {
                $push: { canciones: id }
            });
        }
        
        res.redirect('/canciones/1');

    } catch(err) {
        console.error('Error:', err)
    }
}

// ELIMINAR CANCION
exports.eliminarCancion = async (req, res) => {
    try {
        const id = req.params.id;

        // buscar canción
        const cancion = await Cancion.findById(id);

        // quitar referencia del disco
        await Disco.findByIdAndUpdate(cancion.del_disco, {
            $pull: { canciones: cancion._id}    
        })

        // borrar canción
        await Cancion.findByIdAndDelete(id);

        res.redirect('/canciones/1')
    
    } catch(err) {
        console.error('Error:', err)
    }
}