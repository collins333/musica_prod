"use strict";

require("dotenv").config();
//console.log(process.env.MONGO_URI);

const mongoose = require("mongoose");

const connection = require("../src/config/db-connection");

const Interprete = require("../src/model/Interprete");
const Disco = require("../src/model/Disco");
const Cancion = require("../src/model/Cancion");

const normalizarTexto = require("../src/helpers/normalizarTexto");

const migrar = async () => {
  try {
    //const URL_CONNECT = process.env.URL_CONNECT || 'mongodb://127.0.0.1:27017/musica';

    await connection();

    console.log("Mongo conectado");

    // Intérpretes
    const interpretes = await Interprete.find();

    for (const interprete of interpretes) {
      //   interprete.nombre_normalizado = normalizarTexto(interprete.nombre);

      await Interprete.findByIdAndUpdate(interprete._id, {
        nombre_normalizado: normalizarTexto(interprete.nombre),
      });
    }
    console.log("Intérpretes migrados");

    // Discos
    const discos = await Disco.find();

    for (const disco of discos) {
      await Disco.findByIdAndUpdate(disco._id, {
        titulo_normalizado: normalizarTexto(disco.titulo),
      });
    }
    //   disco.titulo_normalizado = normalizarTexto(disco.titulo);

    //   await disco.save();
    console.log("Discos migrados");

    // Canciones
    const canciones = await Cancion.find();

    for (const cancion of canciones) {
      await Cancion.findByIdAndUpdate(cancion._id, {
        tit_cancion_normalizado: normalizarTexto(cancion.tit_cancion),

        artista_pista_normalizado: normalizarTexto(cancion.artista_pista || ""),
      });
    }
    //   cancion.tit_cancion_normalizado = normalizarTexto(cancion.tit_cancion);

    //   cancion.artista_pista_normalizado = normalizarTexto(cancion.artista_pista || '');

    //   await cancion.save();
    console.log("Canciones migradas");
    console.log("Migración completada");

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};
migrar();
