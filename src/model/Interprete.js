'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterpreteSchema = new Schema({
  nombre: String,
  nacionalidad: String,
  info: String,
  caratula: String,
  discos: [{type: Schema.Types.ObjectId, ref: "Disco"}],
  canciones: [{type: Schema.Types.ObjectId, ref: "Cancion"}]
});

module.exports = mongoose.model('Interprete', InterpreteSchema);