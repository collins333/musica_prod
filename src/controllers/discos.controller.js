"use strict";

const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");
const Interprete = require("../model/Interprete");

// LISTAR DISCOS
exports.listarDiscos = async (req, res) => {
  try {
    const porPagina = 5;
    const paginaCantantes = parseInt(req.query.paginaCantantes) || 1;

    const letra = req.query.letra;
    let filtro = {};

    if (letra) {
      filtro.nombre = {
        $regex: "^" + letra,
        $options: "i",
      };
    }

    const interpretes = await Interprete.find(filtro)
      .sort({ nombre: 1 })
      .skip((paginaCantantes - 1) * porPagina)
      .limit(porPagina)
      .lean();

    // para cada intérprete -> buscar discos
    const interpretesConDiscos = await Promise.all(
      interpretes.map(async (interprete) => {
        const discos = await Disco.find({ interprete: interprete._id })
          .sort({ anyo: 1, titulo: 1 })
          .lean();

        return {
          interprete,
          discos,
        };
      }),
    );

    const totalInterpretes = await Interprete.countDocuments(filtro);

    const letrasExistentes = await Interprete.aggregate([
      {
        $project: {
          primeraLetra: {
            $toUpper: {
              $substr: ["$nombre", 0, 1],
            },
          },
        },
      },
      {
        $group: {
          _id: "$primeraLetra",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.render("discos", {
      title: "índice de discos",
      interpretesConDiscos,
      paginaCantantes,
      paginas: Math.ceil(totalInterpretes / porPagina),
      letra: letra || null,
      letrasExistentes: letrasExistentes.map((l) => l._id),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// VER DISCO
exports.verDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const porPagina = 6;

    const paginaCantantes = parseInt(req.query.paginaCantantes) || 1;
    const paginaDiscos = parseInt(req.query.paginaDiscos) || 1;
    const paginaCanciones = parseInt(req.query.paginaCanciones) || 1;

    const letra = req.query.letra || null;

    const disco = await Disco.findById(id).lean();

    const interprete = await Interprete.findById(disco.interprete).lean();

    const totalCanciones = await Cancion.countDocuments({
      del_disco: id,
    });

    const canciones = await Cancion.find({ del_disco: id })
      .sort({ num_cancion: 1 })
      .skip((paginaCanciones - 1) * porPagina)
      .limit(porPagina)
      .lean();

    res.render("verDisco", {
      title: "toda la información del disco",
      disco,
      interprete,
      canciones,
      paginaCantantes,
      paginaDiscos,
      paginaCanciones,
      letra,
      paginasCanciones: Math.ceil(totalCanciones / porPagina),
      porPagina,
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// IR FORMULARIO NUEVO DISCO
exports.formNuevoDisco = async (req, res) => {
  const letra = req.query.letra || null;
  const paginaCantantes = parseInt(req.query.paginaCantantes) || 1;

  const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

  res.render("nuevoDisco", {
    title: "Añadir disco",
    interpretes,
    letra,
    paginaCantantes
  });
};

// CREAR DISCO
exports.crearDisco = async (req, res) => {
  try {
    req.body.esAudioLocal = !!req.body.esAudioLocal;

    const disco = new Disco(req.body);
    await disco.save();

    // añadir disco al interprete
    const interprete = await Interprete.findByIdAndUpdate(
      req.body.interprete,
      {
        $push: { discos: disco._id },
      },
      { new: true },
    );

    // letra actual
    const letra = interprete.nombre[0].toUpperCase();
    const porPagina = 5;

    const interpretesLetra = await Interprete.find({
      nombre: {
        $regex: "^" + letra,
        $options: "i",
      },
    })
      .sort({ nombre: 1 })
      .lean();

    const posicion = interpretesLetra.findIndex(
      (i) => i._id.toString() === interprete._id.toString(),
    );

    // página donde caerá
    const pagina = Math.ceil((posicion + 1) / porPagina);

    res.redirect(`/discos?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO EDITAR DISCO
exports.formEditarDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const letra = req.query.letra || null;
    const pagina = req.query.pagina || 1;

    const disco = await Disco.findById(id).lean();

    const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

    res.render("editDisco", {
      title: "Editar disco",
      disco,
      interpretes,
      letra,
      pagina,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// EDITAR DISCO
exports.editarDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const discoOriginal = await Disco.findById(id);

    const nuevoInterpreteId = req.body.interprete;
    const interpreteAnteriorId = discoOriginal.interprete.toString();

    // actualizar disco
    const discoActualizado = await Disco.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // si cambió intérprete
    if (interpreteAnteriorId !== nuevoInterpreteId) {
      // quitar del anterior
      await Interprete.findByIdAndUpdate(interpreteAnteriorId, {
        $pull: { discos: id },
      });

      // añadir al nuevo
      await Interprete.findByIdAndUpdate(nuevoInterpreteId, {
        $push: { discos: id },
      });
    }

    // intérprete actual
    const interprete = await Interprete.findById(discoActualizado.interprete);

    // letra actual
    const letra = interprete.nombre[0].toUpperCase();

    const porPagina = 5;

    const interpretesLetra = await Interprete.find({
      nombre: {
        $regex: "^" + letra,
        $options: "i",
      },
    })
      .sort({ nombre: 1 })
      .lean();

    const posicion = interpretesLetra.findIndex(
      (i) => i._id.toString() === interprete._id.toString(),
    );

    // pagina
    const pagina = Math.ceil((posicion + 1) / porPagina);

    res.redirect(`/discos?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// ELIMINAR DISCO
exports.eliminarDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const disco = await Disco.findById(id);

    const interpreteId = disco.interprete;

    // borrar canciones relacionadas
    await Cancion.deleteMany({
      del_disco: id,
    });

    // quitar disco del interprete
    await Interprete.findByIdAndUpdate(interpreteId, {
      $pull: { discos: id }
    });

    // borrar disco
    await Disco.findByIdAndDelete(id);

    res.redirect(`/verCantante/${interpreteId}`);

  } catch (err) {
    console.error("Error:", err);
  }
};
