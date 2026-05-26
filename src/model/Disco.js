"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscoSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
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

module.exports = mongoose.model("Disco", DiscoSchema);
