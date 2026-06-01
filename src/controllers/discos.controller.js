"use strict";

const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");
const Interprete = require("../model/Interprete");

const obtenerLetrasExistentes = require("../helpers/letras");
const construirQuery = require("../helpers/contexto");
const obtenerContexto = require("../helpers/obtenerContexto");

// LISTAR DISCOS
exports.listarDiscos = async (req, res) => {
  try {
    const contexto = obtenerContexto(req);

    const porPagina = 5;
    
    let filtro = {};

    if (contexto.letra) {
      filtro.nombre = {
        $regex: "^" + contexto.letra,
        $options: "i",
      };
    }

    const interpretes = await Interprete.find(filtro)
      .sort({ nombre: 1 })
      .skip((contexto.paginaCantantes - 1) * porPagina)
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

    const letrasExistentes = await obtenerLetrasExistentes();

    res.render("discos", {
      title: "índice de discos",
      interpretesConDiscos,
      paginas: Math.ceil(totalInterpretes / porPagina),
      letrasExistentes,
      ...contexto
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// VER DISCO
exports.verDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const contexto = obtenerContexto(req);

    const porPagina = 6;

    const disco = await Disco.findById(id).lean();

    const interprete = await Interprete.findById(disco.interprete).lean();

    const totalCanciones = await Cancion.countDocuments({
      del_disco: id,
    });

    const canciones = await Cancion.find({ del_disco: id })
      .sort({ num_cancion: 1 })
      .skip((contexto.paginaCanciones - 1) * porPagina)
      .limit(porPagina)
      .lean();

    res.render("verDisco", {
      title: "toda la información del disco",
      disco,
      interprete,
      canciones,
      paginasCanciones: Math.ceil(totalCanciones / porPagina),
      porPagina,
      ...contexto
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// IR FORMULARIO NUEVO DISCO
exports.formNuevoDisco = async (req, res) => {
  const contexto = obtenerContexto(req);
  
  const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

  res.render("nuevoDisco", {
    title: "Añadir disco",
    interpretes,
    ...contexto
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

    const obtenerPaginaInterprete = require("../helpers/paginacion");

    const porPagina = 5;

    const pagina = await obtenerPaginaInterprete(
      interprete._id,
      letra,
      porPagina,
    );

    res.redirect(`/discos?letra=${letra}&paginaCantantes=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO EDITAR DISCO
exports.formEditarDisco = async (req, res) => {
  try {
    const id = req.params.id;

    const contexto = obtenerContexto(req);
    
    const disco = await Disco.findById(id).lean();

    const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

    res.render("editDisco", {
      title: "Editar disco",
      disco,
      interpretes,
      ...contexto
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

    const obtenerPaginaInterprete = require("../helpers/paginacion");

    const porPagina = 5;

    const pagina = await obtenerPaginaInterprete(
      interprete._id,
      letra,
      porPagina,
    );

    res.redirect(`/discos?letra=${letra}&paginaCantantes=${pagina}`);
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
      $pull: { discos: id },
    });

    // borrar disco
    await Disco.findByIdAndDelete(id);

    res.redirect(`/verCantante/${interpreteId}`);
  } catch (err) {
    console.error("Error:", err);
  }
};
