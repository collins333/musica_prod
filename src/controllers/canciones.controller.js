"use strict";

const { json } = require("body-parser");
const Cancion = require("../model/Cancion");
const Disco = require("../model/Disco");
const Interprete = require("../model/Interprete");

// LISTAR CANCIONES
exports.listarCanciones = async (req, res) => {
  try {
    const porPagina = 2;
    const pagina = parseInt(req.query.pagina) || 1;
    const letra = req.query.letra;

    let filtro = {};

    if (letra) {
      filtro.nombre = {
        $regex: "^" + letra,
        $options: "i",
      };
    }

    // intérpretes paginados
    const interpretes = await Interprete.find(filtro)
      .sort({ nombre: 1 })
      .skip((pagina - 1) * porPagina)
      .limit(porPagina)
      .lean();

    // construir estructura
    const interpretesConDiscos = await Promise.all(
      interpretes.map(async (interprete) => {
        const discos = await Disco.find({ interprete: interprete._id })
          .sort({ anyo: 1, titulo: 1 })
          .lean();

        const discosConCanciones = await Promise.all(
          discos.map(async (disco) => {
            const canciones = await Cancion.find({ del_disco: disco._id })
              .sort({ num_cancion: 1 })
              .lean();

            return {
              disco,
              canciones,
            };
          }),
        );

        return {
          interprete,
          discos: discosConCanciones,
        };
      }),
    );

    // total intérpretes
    const totalInterpretes = await Interprete.countDocuments(filtro);

    // letras existentes
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

    res.render("canciones", {
      title: "índice de canciones",
      interpretesConDiscos,
      pagina,
      paginas: Math.ceil(totalInterpretes / porPagina),
      letra: letra || null,
      letrasExistentes: letrasExistentes.map((l) => l._id),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// VER CANCION
exports.verCancion = async (req, res) => {
  try {
    const id = req.params.id;

    // contexto navegación
    const letra = req.query.letra || null;
    const pagina = parseInt(req.query.pagina) || 1;

    // paginaciones internas
    const paginaDiscos = parseInt(req.query.paginaDiscos) || 1;
    const paginaCanciones = parseInt(req.query.paginaCanciones) || 1;

    const cancion = await Cancion.findById(id)
      .populate({
        path: "del_disco",
        populate: {
          path: "interprete",
          model: "Interprete",
        },
      })
      .lean();

    res.render("verCancion", {
      title: "información de la canción",
      cancion,
      letra,
      pagina,
      paginaDiscos,
      paginaCanciones
    });

  } catch (error) {
    console.error("Error:", error);
  }
};

// IR A FORMULARIO CANCION NUEVA
exports.formNuevaCancion = async (req, res) => {
  try {
    // const letra = req.query.letra || null;
    // const pagina = parseInt(req.query.pagina) || 1;

    const discos = await Disco.find()
      .populate("interprete")
      .sort({ titulo: 1 })
      .lean();

    res.render("nuevaCancion", {
      title: "Añadir canción",
      discos,
      // letra,
      // pagina,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

// CREAR NUEVA CANCION
exports.crearCancion = async (req, res) => {
  try {
    // buscar disco
    const disco = await Disco.findById(req.body.del_disco);

    // crear canción
    const cancion = new Cancion(req.body);

    await cancion.save();

    disco.canciones.push(cancion._id);

    await disco.save();

    // buscar interprete
    const interprete = await Interprete.findById(disco.interprete);

    const letra = interprete.nombre[0].toUpperCase();

    const porPagina = 2;

    // intérpretes de esa letra
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

    res.redirect(`/canciones?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// IR A FORMULARIO EDITAR CANCION
exports.formEditarCancion = async (req, res) => {
  try {
    const id = req.params.id;

    const letra = req.query.letra || null;
    const pagina = parseInt(req.query.pagina) || 1;

    const cancion = await Cancion.findById(id).lean();

    const discos = await Disco.find()
      .populate("interprete")
      .sort({ titulo: 1 })
      .lean();

    res.render("editCancion", {
      title: "Editar canción",
      cancion,
      discos,
      letra,
      pagina,
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

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

    // actualizar intérprete automáticamente
    //req.body.del_interprete = nuevoDisco.interprete;

    // actualizar canción
    await Cancion.findByIdAndUpdate(id, req.body);

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
    const porPagina = 2;

    // intérpretes de esa letra
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

    res.redirect(`/canciones?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};

// ELIMINAR CANCION
exports.eliminarCancion = async (req, res) => {
  try {
    const id = req.params.id;

    // buscar canción
    const cancion = await Cancion.findById(id);

    // buscar disco
    const disco = await Disco.findById(cancion.del_disco);

    // buscar intérprete
    const interprete = await Interprete.findById(disco.interprete);

    const letra = interprete.nombre[0].toUpperCase();

    const porPagina = 2;

    // intérpretes de esa letra
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

    // quitar referencia del disco
    await Disco.findByIdAndUpdate(cancion.del_disco, {
      $pull: { canciones: cancion._id },
    });

    // borrar y eliminar canción
    await Cancion.findByIdAndDelete(id);

    res.redirect(`/canciones?letra=${letra}&pagina=${pagina}`);
  } catch (err) {
    console.error("Error:", err);
  }
};
