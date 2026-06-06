"use strict";

const Interprete = require("../model/Interprete");
const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");

const obtenerLetrasExistentes = require("../helpers/letras");
const construirQuery = require("../helpers/contexto");
const obtenerContexto = require("../helpers/obtenerContexto");
const asyncHandler = require("../middlewares/asyncHandler");
const { obtenerSkip, obtenerPaginaInterprete } = require('../helpers/paginacion')
const PAGINACION = require('../config/paginacion');
const normalizarTexto = require("../helpers/normalizarTexto");
const escapeRegex = require('../helpers/escapeRegex');

exports.home = asyncHandler(async (req, res, next) => {
  res.render("index", {
    title: "mi coleccion de música",
  });
});

// LISTAR CANTANTES
exports.listarCantantes = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  const porPagina = PAGINACION.cantantes;

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
    .lean();

  const cuenta = await Interprete.countDocuments(filtro);

  // letras existentes
  const letrasExistentes = await obtenerLetrasExistentes();

  res.render("cantantes", {
    interpretes,
    paginas: Math.ceil(cuenta / porPagina),
    totalPaginasCantantes: Math.ceil(cuenta / porPagina),
    title: "índice de cantantes",
    letrasExistentes,
    ...contexto,
  });
});

// VER CANTANTE
exports.verCantante = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);

  const porPagina = PAGINACION.discosPorCantante;

  const interprete = await Interprete.findById(id).lean();

  if (!interprete) {
    return res.status(404).render('noEncontrado', {
      title: "Cantante no encontrado",
    });
  }

  const totalDiscos = await Disco.countDocuments({
    interprete: id,
  });

  const discos = await Disco.find({ interprete: id })
    .sort({ anyo: 1, titulo: 1 })
    .skip(obtenerSkip(contexto.paginaDiscos, porPagina))
    .limit(porPagina)
    .lean();

  res.render("verCantante", {
    interprete,
    discos,
    totalPaginasDiscos: Math.ceil(totalDiscos / porPagina),
    title: "toda la información del cantante",
    totalDiscos,
    ...contexto,
  });
});

// IR FORMULARIO CREAR CANTANTE
exports.formNuevoInterprete = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  res.render("nuevoInterprete", {
    title: "Añadir cantante",
    ...contexto,
  });
});

// CREAR CANTANTE
exports.crearInterprete = asyncHandler(async (req, res, next) => {
  const interprete = new Interprete(req.body);

  await interprete.save();

  const letra = interprete.nombre[0].toUpperCase();

  const porPagina = PAGINACION.cantantes;

  const pagina = await obtenerPaginaInterprete(
    interprete._id,
    letra,
    porPagina,
  );

  res.redirect(`/cantantes?letra=${letra}&paginaCantantes=${pagina}`);
});

// IR FORMULARIO EDITAR CANTANTE
exports.formEditarInterprete = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);

  const interprete = await Interprete.findById(id).lean();

  res.render("editCantante", {
    title: "Editar intérprete",
    interprete,
    ...contexto,
  });
});

// EDITAR CANTANTE
exports.editarInterprete = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const datos = {
    ...req.body,
    nombre_normalizado: normalizarTexto(req.body.nombre)
  };

  await Interprete.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
  });

  res.redirect(`/verCantante/${id}`);
});

// ELIMINAR CANTANTE
exports.eliminarInterprete = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const interprete = await Interprete.findById(id);

  if (!interprete) {
    return res.redirect('/cantantes');
  }

  const letra = interprete.nombre[0].toUpperCase();

  // buscar discos del interprete
  const discos = await Disco
    .find({ interprete: id })
    .select('_id')
    .lean();

  // ids discos
  const discosIds = discos.map((d) => d._id);

  // borrar canciones, discos e intérprete
  await Promise.all([
    Cancion.deleteMany({
      del_disco: {
        $in: discosIds 
      }
    }),
    Disco.deleteMany({ interprete: id }),
    Interprete.findByIdAndDelete(id)
  ]);

  res.redirect(`/cantantes?letra=${letra}`);
});

// BUSCADOR
exports.buscar = asyncHandler(async (req, res, next) => {
  const texto = req.query.buscar?.trim() || '';
  const textoNormalizado = escapeRegex(
    normalizarTexto(texto)
  );

  if (!texto) {
    return res.render("noEncontrado", {
      title: "buscador de cantantes y discos",
    });
  }

  const interpretes = await Interprete
    .find({
      nombre_normalizado: { 
        $regex: '^' + textoNormalizado, 
      },
    })
    .sort({ nombre: 1 })
    .lean();

  const discos = await Disco
    .find({
      titulo_normalizado: 
      { 
        $regex: '^' + textoNormalizado, 
      },
    })
    .sort({ titulo: 1 })
    .lean();

  const canciones = await Cancion.find({
    $or: [
      {
        tit_cancion_normalizado: {
          $regex: '^' + textoNormalizado,
        },
      },
      {
        artista_pista_normalizado: {
          $regex: '^' + textoNormalizado,
        },
      },
    ],
  }).populate({
    path: "del_disco",
    populate: {
      path: "interprete",
      model: "Interprete",
    },
  });

  if (
    interpretes.length === 0 &&
    discos.length === 0 &&
    canciones.length === 0
  ) {
    return res.render("noEncontrado", {
      title: "buscador de cantantes, discos y canciones",
    });
  }

  res.render("buscar", {
    title: "buscador de cantantes, discos y canciones",
    query: texto,
    interpretes,
    discos,
    canciones,
  });
});
