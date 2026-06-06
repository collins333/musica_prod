"use strict";

const Cancion = require("../model/Cancion");
const Disco = require("../model/Disco");
const Interprete = require("../model/Interprete");

const obtenerLetrasExistentes = require("../helpers/letras");
const construirQuery = require("../helpers/contexto");
const obtenerContexto = require("../helpers/obtenerContexto");
const asyncHandler = require("../middlewares/asyncHandler");
const { obtenerSkip, obtenerPaginaInterprete } = require('../helpers/paginacion');
const PAGINACION = require('../config/paginacion');
const normalizarTexto = require("../helpers/normalizarTexto");

// LISTAR CANCIONES
exports.listarCanciones = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  const porPagina = PAGINACION.interpretesEnCanciones;

  let filtro = {};

  if (contexto.letra) {
    filtro.nombre_normalizado = {
      $regex: "^" + normalizarTexto(contexto.letra),
    };
  }

  // intérpretes paginados
  const interpretes = await Interprete
    .find(filtro)
    .sort({ nombre: 1 })
    .skip(obtenerSkip(contexto.paginaCantantes, porPagina))
    .limit(porPagina)
    .populate({
      path: 'discos',
      options: { sort: { anyo: 1, titulo: 1 }},
      populate: {
        path: 'canciones',
        options: { sort: { num_cancion: 1 }}
      }
    })
    .lean();

  // construir estructura
  const interpretesConDiscos = interpretes.map(
    ({ discos, ...interprete }) => {
      const discosConCanciones = 
        (discos || []).map(
          ({ canciones, ...disco}) => ({
            disco,
            canciones: canciones || [],
          })
        );

      return {
        interprete, 
        discos: discosConCanciones,
      };
    });

  // total intérpretes
  const totalInterpretes = await Interprete.countDocuments(filtro);

  // letras existentes
  const letrasExistentes = await obtenerLetrasExistentes();

  res.render("canciones", {
    title: "índice de canciones",
    interpretesConDiscos,
    paginas: Math.ceil(totalInterpretes / porPagina),
    totalPaginasCanciones: Math.ceil(totalInterpretes / porPagina),
    letrasExistentes,
    ...contexto,
  });
});

// VER CANCION
exports.verCancion = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  // contexto navegación
  const contexto = obtenerContexto(req);

  const cancion = await Cancion.findById(id)
    .populate({
      path: "del_disco",
      populate: {
        path: "interprete",
        model: "Interprete",
      },
    })
    .lean();

    if (!cancion) {
      return res.status(404).render('noEncontrado', {
        title: 'Canción no encontrada'
      });
    }

  res.render("verCancion", {
    title: "información de la canción",
    cancion,
    ...contexto,
  });
});

// IR A FORMULARIO CANCION NUEVA
exports.formNuevaCancion = asyncHandler(async (req, res, next) => {
  const contexto = obtenerContexto(req);

  const discos = await Disco.find()
    .populate("interprete")
    .sort({ titulo: 1 })
    .lean();

  res.render("nuevaCancion", {
    title: "Añadir canción",
    discos,
    ...contexto,
  });
});

// CREAR NUEVA CANCION
exports.crearCancion = asyncHandler(async (req, res, next) => {
  // buscar disco
  const disco = await Disco.findById(req.body.del_disco);

  if (!disco) {
    return res.status(404).render('noEncontrado', {
      title: 'Disco no encontrado'
    });
  }

  // crear canción
  const cancion = new Cancion(req.body);

  await cancion.save();

  disco.canciones.push(cancion._id);

  await disco.save();

  // buscar interprete
  const interprete = await Interprete.findById(disco.interprete);

  const letra = interprete.nombre[0].toUpperCase();

  const porPagina = PAGINACION.interpretesEnCanciones;

  const pagina = await obtenerPaginaInterprete(
    interprete._id,
    letra,
    porPagina,
  );

  res.redirect(`/canciones?letra=${letra}&paginaCantantes=${pagina}`);
});

// IR A FORMULARIO EDITAR CANCION
exports.formEditarCancion = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);

  const cancion = await Cancion.findById(id).lean();

  const discos = await Disco.find()
    .populate("interprete")
    .sort({ titulo: 1 })
    .lean();

  res.render("editCancion", {
    title: "Editar canción",
    cancion,
    discos,
    ...contexto,
  });
});

// EDITAR CANCION
exports.editarCancion = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  // canción original
  const cancionOriginal = await Cancion.findById(id);

  if (!cancionOriginal) {
    return res.status(404).render('noEncontrado', { title: 'Canción no encontrada'});
  }

  // nuevo disco
  const nuevoDiscoId = req.body.del_disco;

  // disco anterior
  const discoAnteriorId = cancionOriginal.del_disco.toString();

  // buscar nuevo disco
  const nuevoDisco = await Disco.findById(nuevoDiscoId);

  const datos = {
    ...req.body,
    tit_cancion_normalizado: normalizarTexto(req.body.tit_cancion),
    artista_pista_normalizado: normalizarTexto(req.body.artista_pista || ''),
  }

  // actualizar canción
  await Cancion.findByIdAndUpdate(
    id,
    datos, {
      new: true,
      runValidators: true,
    });

  // si se cambió de disco -> sincronizar
  if (discoAnteriorId !== nuevoDiscoId) {
    // quitar del disco anterior
    await Disco.findByIdAndUpdate(discoAnteriorId, {
      $pull: { canciones: id },
    });

    // añadir al nuevo disco
    await Disco.findByIdAndUpdate(nuevoDiscoId, {
      $push: { canciones: id },
    });
  }

  // buscar intérprete nuevo
  const interprete = await Interprete.findById(nuevoDisco.interprete);

  const letra = interprete.nombre[0].toUpperCase();

  const porPagina = PAGINACION.interpreteEnCanciones;

  const pagina = await obtenerPaginaInterprete(
    interprete._id,
    letra,
    porPagina,
  );

  res.redirect(`/canciones?letra=${letra}&paginaCantantes=${pagina}`);
});

// ELIMINAR CANCION
exports.eliminarCancion = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const contexto = obtenerContexto(req);
  
  const cancion = await Cancion.findById(id);

  if (!cancion) {
    return res.redirect('/canciones');
  }

  // quitar referencia del disco y canción
  await Promise.all([
    Disco.findByIdAndUpdate(cancion.del_disco, {
      $pull: { canciones: cancion._id },
    }),
    
    Cancion.findByIdAndDelete(id)
  ]);

  res.redirect(
    `/verDisco/${cancion.del_disco}?${contexto.query}`
  );
});
