"use strict";

require("dotenv").config();

const mongoose = require("mongoose");

const connection = require("../src/config/db-connection");

const Cancion = require("../src/model/Cancion");

const eliminarDelInterprete = async () => {
  try {
    await connection();

    const totalAntes = await Cancion.countDocuments({
      del_interprete: { $exists: true }
    });

    console.log("Canciones con del_interprete:", totalAntes);

    // usar colección nativa
    const resultado = await Cancion.collection.updateMany(
      {},
      {
        $unset: {
          del_interprete: ""
        }
      }
    );

    console.log(resultado);

    const totalDespues = await Cancion.countDocuments({
      del_interprete: { $exists: true }
    });

    console.log("Después:", totalDespues);

    await mongoose.connection.close();

  } catch (err) {
    console.error(err);
    await mongoose.connection.close();
  }
};

eliminarDelInterprete();