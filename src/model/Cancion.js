'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CancionSchema = new Schema({
  num_cancion: String,
  tit_cancion: String,
  dur_cancion: String,
  enlace: String,
  del_disco: {type: Schema.Types.ObjectId, ref: 'Disco'},
  del_interprete: {type: Schema.Types.ObjectId, ref: 'Interprete'}
});

module.exports = mongoose.model('Cancion', CancionSchema);