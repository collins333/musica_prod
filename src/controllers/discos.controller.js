"use strict";

const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");
const Interprete = require("../model/Interprete");

const obtenerLetrasExistentes = require("../helpers/letras");
const construirQuery = require("../helpers/contexto");
const obtenerContexto = require("../helpers/obtenerContexto");
const asyncHandler = require("../middlewares/asyncHandler");
const { obtenerSkip, obtenerPaginaInterprete } = require('../helpers/paginacion');
const PAGINACION = require('../config/paginacion');
const normalizarTexto = require('../helpers/normalizarTexto');

// LISTAR DISCOS
exports.listarDiscos = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  const porPagina = PAGINACION.interpretesEnDiscos;

  let filtro = {};

  if (contexto.letra) {
    filtro.nombre_normalizado = {
      $regex: "^" + normalizarTexto(contexto.letra),
    };
  }

  const interpretes = await Interprete.find(filtro)
    .sort({ nombre: 1 })
    .skip(obtenerSkip(contexto.paginaCantantes, porPagina))
    .limit(porPagina)
    .populate({
      path: 'discos',
      options: {
        sort: { anyo: 1, titulo: 1}
      }
    })
    .lean();

  // para cada intérprete -> buscar discos
  const interpretesConDiscos = interpretes.map(
      ({ discos, ...interprete }) => ({
      interprete,
      discos: discos || []
    })
  );

  const totalInterpretes = await Interprete.countDocuments(filtro);

  const letrasExistentes = await obtenerLetrasExistentes();

  res.render("discos", {
    title: "índice de discos",
    interpretesConDiscos,
    paginas: Math.ceil(totalInterpretes / porPagina),
    totalPaginasDiscos: Math.ceil(totalInterpretes / porPagina),
    letrasExistentes,
    ...contexto,
  });
});

// VER DISCO
exports.verDisco = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);

  const porPagina = PAGINACION.cancionesPorDisco;

  const disco = await Disco.findById(id).lean();

  if (!disco) {
    return res.status(404).render('noEncontrado', {
      title: 'Disco no encontrado'
    });
  }

  const interprete = await Interprete.findById(disco.interprete).lean();

  const totalCanciones = await Cancion.countDocuments({
    del_disco: id,
  });

  const canciones = await Cancion.find({ del_disco: id })
    .sort({ num_cancion: 1 })
    .skip(obtenerSkip(contexto.paginaCanciones, porPagina))
    .limit(porPagina)
    .lean();

  res.render("verDisco", {
    title: "toda la información del disco",
    disco,
    interprete,
    canciones,
    totalPaginasCanciones: Math.ceil(totalCanciones / porPagina),
    porPagina,
    ...contexto,
  });
});

// IR FORMULARIO NUEVO DISCO
exports.formNuevoDisco = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

  res.render("nuevoDisco", {
    title: "Añadir disco",
    interpretes,
    ...contexto,
  });
});

// CREAR DISCO
exports.crearDisco = asyncHandler(async (req, res, next) => {
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

  const porPagina = PAGINACION.discosPorCantante;

  const pagina = await obtenerPaginaInterprete(
    interprete._id,
    letra,
    porPagina,
  );

  res.redirect(`/discos?letra=${letra}&paginaCantantes=${pagina}`);
});

// IR FORMULARIO EDITAR DISCO
exports.formEditarDisco = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);

  const disco = await Disco.findById(id).lean();

  const interpretes = await Interprete.find().sort({ nombre: 1 }).lean();

  res.render("editDisco", {
    title: "Editar disco",
    disco,
    interpretes,
    ...contexto,
  });
});

// EDITAR DISCO
exports.editarDisco = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const discoOriginal = await Disco.findById(id);

  const nuevoInterpreteId = req.body.interprete;
  const interpreteAnteriorId = discoOriginal.interprete.toString();

  const datos = {
    ...req.body,
    titulo_normalizado: normalizarTexto(req.body.titulo)
  };

  // actualizar disco
  const discoActualizado = await Disco.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
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

  const pagina = await obtenerPaginaInterprete(
    interprete._id,
    letra,
    porPagina,
  );

  res.redirect(`/discos?letra=${letra}&paginaCantantes=${pagina}`);
});

// ELIMINAR DISCO
exports.eliminarDisco = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const disco = await Disco.findById(id);

  if (!disco) {
    return res.redirect('/Cantantes');
  }

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
});
