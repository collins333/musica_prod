"use strict";

const Interprete = require("../model/Interprete");
const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");

const obtenerLetrasExistentes = require("../helpers/letras");
const construirQuery = require("../helpers/contexto");
const obtenerContexto = require('../helpers/obtenerContexto');

exports.home = (req, res) => {
  res.render("index", {
    title: "mi coleccion de música",
  });
};

// LISTAR CANTANTES
exports.listarCantantes = async (req, res) => {
  try {
    const contexto = obtenerContexto(req);

    const porPagina = 10;
    
    let filtro = {};

    if (contexto.letra) {
      filtro.nombre = {
        $regex: "^" + contexto.letra,
        $options: "i",
      };
    }

    const interpretes = await Interprete.find(filtro)
      .sort({ nombre: 1 })
      .skip(porPagina * contexto.paginaCantantes - porPagina)
      .limit(porPagina)
      .lean();

    const cuenta = await Interprete.countDocuments(filtro);

    // letras existentes
    const letrasExistentes = await obtenerLetrasExistentes();

    res.render("cantantes", {
      interpretes,
      paginas: Math.ceil(cuenta / porPagina),
      title: "índice de cantantes",
      letrasExistentes,
      ...contexto
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// VER CANTANTE
exports.verCantante = async (req, res) => {
  try {
    const id = req.params.id;

    const contexto = obtenerContexto(req);

    const porPagina = 6;
    
    const interprete = await Interprete.findById(id).lean();

    const totalDiscos = await Disco.countDocuments({
      interprete: id,
    });

    const discos = await Disco.find({ interprete: id })
      .sort({ anyo: 1, titulo: 1 })
      .skip((contexto.paginaDiscos - 1) * porPagina)
      .limit(porPagina)
      .lean();

    res.render("verCantante", {
      interprete,
      discos,
      paginasDiscos: Math.ceil(totalDiscos / porPagina),
      title: "toda la información del cantante",
      totalDiscos,
      ...contexto
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO CREAR CANTANTE
exports.formNuevoInterprete = (req, res) => {
  const contexto = obtenerContexto(req);
  
  res.render("nuevoInterprete", {
    title: "Añadir cantante",
    ...contexto
  });
};

// CREAR CANTANTE
exports.crearInterprete = async (req, res) => {
  try {
    const interprete = new Interprete(req.body);

    await interprete.save();

    const letra = interprete.nombre[0].toUpperCase();

    const obtenerPaginaInterprete = require("../helpers/paginacion");

    const porPagina = 10;

    const pagina = await obtenerPaginaInterprete(
      interprete._id,
      letra,
      porPagina,
    );

    res.redirect(`/cantantes?letra=${letra}&paginaCantantes=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO EDITAR CANTANTE
exports.formEditarInterprete = async (req, res) => {
  try {
    const id = req.params.id;

    const contexto = obtenerContexto(req);

    const interprete = await Interprete.findById(id).lean();

    res.render("editCantante", {
      title: "Editar intérprete",
      interprete,
      ...contexto
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// EDITAR CANTANTE
exports.editarInterprete = async (req, res) => {
  try {
    const id = req.params.id;

    const interprete = await Interprete.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.redirect(`/verCantante/${id}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// ELIMINAR CANTANTE
exports.eliminarInterprete = async (req, res) => {
  try {
    const id = req.params.id;

    const interprete = await Interprete.findById(id);

    const letra = interprete.nombre[0].toUpperCase();

    // buscar discos del interprete
    const discos = await Disco.find({
      interprete: id,
    });

    // ids discos
    const discosIds = discos.map((d) => d._id);

    // borrar canciones
    await Cancion.deleteMany({
      del_disco: { $in: discosIds },
    });

    // borrar discos
    await Disco.deleteMany({
      interprete: id,
    });

    // borrar intérprete
    await Interprete.findByIdAndDelete(id);

    res.redirect(`/cantantes?letra=${letra}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// BUSCADOR
exports.buscar = async (req, res) => {
  try {
    const texto = req.query.buscar.trim();

    if (!texto) {
      return res.render("noEncontrado", {
        title: "buscador de cantantes y discos",
      });
    }

    const interpretes = await Interprete.find({
      nombre: { $regex: texto, $options: "i" },
    })
      .sort({ nombre: 1 })
      .lean();

    const discos = await Disco.find({
      titulo: { $regex: texto, $options: "i" },
    })
      .sort({ titulo: 1 })
      .lean();

    const canciones = await Cancion.find({
      $or: [
        {
          tit_cancion: {
            $regex: texto,
            $options: "i",
          },
        },
        {
          artista_pista: {
            $regex: texto,
            $options: "i",
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
  } catch (err) {
    console.error("Error:", err);
  }
};
