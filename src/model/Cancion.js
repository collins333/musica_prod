"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const normalizarTexto = require("../helpers/normalizarTexto");

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
  tit_cancion_normalizado: {
    type: String,
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
  },
  artista_pista_normalizado: {
    type: String,
    index: true,
  },
});

CancionSchema.pre("save", function () {
  this.tit_cancion_normalizado = normalizarTexto(this.tit_cancion);

  this.artista_pista_normalizado = normalizarTexto(this.artista_pista || "");

  //next();
});

module.exports = mongoose.model("Cancion", CancionSchema);
