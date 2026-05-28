"use strict";

const Interprete = require("../model/Interprete");
const Disco = require("../model/Disco");
const Cancion = require("../model/Cancion");

exports.home = (req, res) => {
  res.render("index", {
    title: "mi coleccion de música",
  });
};

// LISTAR CANTANTES
exports.listarCantantes = async (req, res) => {
  try {
    const porPagina = 10;
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
      .skip(porPagina * paginaCantantes - porPagina)
      .limit(porPagina)
      .lean();

    const cuenta = await Interprete.countDocuments(filtro);

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

    res.render("cantantes", {
      interpretes,
      paginaCantantes,
      paginas: Math.ceil(cuenta / porPagina),
      letra: letra || null,
      title: "índice de cantantes",
      letrasExistentes: letrasExistentes.map((l) => l._id),
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// VER CANTANTE
exports.verCantante = async (req, res) => {
  try {
    const id = req.params.id;

    const porPagina = 6;
    const paginaDiscos = parseInt(req.query.paginaDiscos) || 1;

    const paginaCantantes = req.query.paginaCantantes || 1;
    const letra = req.query.letra || null;

    const interprete = await Interprete.findById(id).lean();

    const totalDiscos = await Disco.countDocuments({
      interprete: id,
    });

    const discos = await Disco.find({ interprete: id })
      .sort({ anyo: 1, titulo: 1 })
      .skip((paginaDiscos - 1) * porPagina)
      .limit(porPagina)
      .lean();

    res.render("verCantante", {
      interprete,
      discos,
      paginaDiscos,
      paginasDiscos: Math.ceil(totalDiscos / porPagina),
      title: "toda la información del cantante",
      totalDiscos,
      paginaCantantes,
      letra,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO CREAR CANTANTE
exports.formNuevoInterprete = (req, res) => {
  const letra = req.query.letra || null;
  const paginaCantantes = parseInt(req.query.paginaCantantes) || 1;

  res.render("nuevoInterprete", {
    title: "Añadir cantante",
    letra,
    paginaCantantes
  });
};

// CREAR CANTANTE
exports.crearInterprete = async (req, res) => {
  try {
    const interprete = new Interprete(req.body);

    await interprete.save();

    const letra = interprete.nombre[0].toUpperCase();

    const porPagina = 10;

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

    const pagina = Math.ceil((posicion + 1) / porPagina);

    res.redirect(`/cantantes?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR FORMULARIO EDITAR CANTANTE
exports.formEditarInterprete = async (req, res) => {
  try {
    const id = req.params.id;

    const interprete = await Interprete.findById(id).lean();

    res.render("editCantante", {
      title: "Editar intérprete",
      interprete,
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
    })
      .populate({
        path: "del_disco",populate: {
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
