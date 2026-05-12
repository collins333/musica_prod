'use strict';

const Disco = require('../model/Disco');
const Cancion = require('../model/Cancion');
const Interprete = require('../model/Interprete');

// LISTAR DISCOS
exports.listarDiscos = async (req, res) => {
    try {
        let porPagina = 15;
        let pagina = Number(req.params.pagina) || 1;

        const discos = await Disco.find({})
            .populate('interprete')
            .populate('canciones');
            
        discos.sort((a, b) => {
            // intérpretes
            const interpreteA = a.interprete.nombre.toLowerCase();
            const interpreteB = b.interprete.nombre.toLowerCase();

            if(interpreteA < interpreteB) return -1;
            if(interpreteA > interpreteB) return 1;

            // año
            if(a.anyo < b.anyo) return -1;
            if(a.anyo > b.anyo) return 1;

            // título
            return a.titulo.localeCompare(b.titulo);
        });

        // Paginación manual
        const inicio = (pagina - 1) * porPagina;
        const fin = inicio + porPagina;

        const discosPaginados = discos.slice(inicio, fin);

        // Total
        const cuenta = discos.length;

        //const cuenta = await Disco.countDocuments();

        res.render('discos', {
            discos: discosPaginados,
            title: 'índice de discos',
            current: pagina,
            paginas: Math.ceil(cuenta / porPagina)
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

// VER DISCO
exports.verDisco = async (req, res) => {
    try {
        let id = req.params.id;

        const disco = await Disco.findById(id)
            .populate({
                path: 'canciones',
            options: {
                sort: {num_cancion: 1}
            }})
            .populate('interprete');

        res.render('verDisco', {
            title: 'toda la información del disco',
            disco
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

// IR FORMULARIO NUEVO DISCO
exports.formNuevoDisco = async (req, res) => {
    const interpretes = await Interprete.find()
        .sort({ nombre: 1 });

    res.render('nuevoDisco', {
        title: 'Añadir disco',
        interpretes
    });
}

// CREAR DISCO
exports.crearDisco = async (req, res) => {
    try {
        req.body.esAudioLocal = !!req.body.esAudioLocal;

        const disco = new Disco(req.body);
        await disco.save();

        // añadir disco al interprete
        await Interprete.findByIdAndUpdate(req.body.interprete, {
            $push: { discos: disco._id }
        });

        res.redirect('discos/1');

    } catch(err) {
        console.error('Error:', err)
    }
}

// IR FORMULARIO EDITAR DISCO
exports.formEditarDisco = async (req, res) => {
    try {
        const id = req.params.id;

        const disco = await Disco.findById(id);

        const interpretes = await Interprete.find()
            .sort({ nombre: 1});

        res.render('editDisco', {
            title: 'Editar disco',
            disco,
            interpretes
        });

    } catch (err) {
        console.error('Error:', err)
    }
}

// EDITAR DISCO
exports.editarDisco = async (req, res) => {
    try {
        const id = req.params.id;

        const discoOriginal = await Disco.findById(id);

        const nuevoInterpreteId = req.body.interprete;
        const interpreteAnteriorId = discoOriginal.interprete.toString();

        // actualizar disco
        await Disco.findByIdAndUpdate(id, req.body);

        // si cambió intérprete
        if(interpreteAnteriorId !== nuevoInterpreteId) {
            // quitar del anterior
            await Interprete.findByIdAndUpdate(interpreteAnteriorId, {
                $pull: { discos: id}
            });

            // añadir al nuevo
            await Interprete.findByIdAndUpdate(nuevoInterpreteId, {
                $push: { discos: id }
            });
        }

        res.redirect('/discos/1');

    } catch (err) {
        console.error('Error:', err)
    }
}

// ELIMINAR DISCO
exports.eliminarDisco = async (req, res) => {
    try {
        const id = req.params.id;

        const disco = await Disco.findById(id);

        // borrar canciones relacionadas
        await Cancion.deleteMany({
            del_disco: id
        });

        // quitar disco del interprete
        await Interprete.findByIdAndUpdate(disco.interprete, {
            $pull: { discos: id }
        });

        // borrar disco
        await Disco.findByIdAndDelete(id);

        res.redirect('/discos/1');

    } catch(err) {
        console.error('Error:', err)
    }
}