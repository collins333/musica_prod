"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const normalizarTexto = require('../helpers/normalizarTexto');

const InterpreteSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  nombre_normalizado: {
    type: String,
    index: true,
  },
  nacionalidad: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  info: String,
  caratula: String,
  discos: [{ type: Schema.Types.ObjectId, ref: "Disco" }],
  //canciones: [{type: Schema.Types.ObjectId, ref: "Cancion"}]
});

InterpreteSchema.pre('save', function() {
  this.nombre_normalizado = normalizarTexto(this.nombre);

  //next();
});

module.exports = mongoose.model("Interprete", InterpreteSchema);
