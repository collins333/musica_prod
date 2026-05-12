'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscoSchema = new Schema({
  titulo: String,
  caratula: String,
  anyo: Number,
  interprete: {type: Schema.Types.ObjectId, ref: "Interprete"},
  info: String,
  canciones: [{type: Schema.Types.ObjectId, ref: "Cancion"}],
  esAudioLocal: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Disco', DiscoSchema);