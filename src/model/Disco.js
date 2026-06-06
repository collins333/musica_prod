"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const normalizarTexto = require('../helpers/normalizarTexto');

const DiscoSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  titulo_normalizado: {
    type: String,
    index: true,
  },
  caratula: String,
  anyo: {
    type: Number,
    required: true,
    trim: true,
  },
  interprete: {
    type: Schema.Types.ObjectId,
    ref: "Interprete",
    index: true,
  },
  info: String,
  canciones: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cancion",
    },
  ],
  esAudioLocal: {
    type: Boolean,
    default: false,
  },
});

DiscoSchema.pre('save', function() {
  this.titulo_normalizado = normalizarTexto(this.titulo);

  //next();
});

module.exports = mongoose.model("Disco", DiscoSchema);
