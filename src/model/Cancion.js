"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CancionSchema = new Schema({
  num_cancion: {
    type: Number,
    required: true,
    trim: true,
  },
  tit_cancion: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  dur_cancion: String,
  enlace: String,
  del_disco: {
    type: Schema.Types.ObjectId,
    ref: "Disco",
    index: true,
  },
  artista_pista: {
    type: String,
    index: true,
  }
});

module.exports = mongoose.model("Cancion", CancionSchema);
