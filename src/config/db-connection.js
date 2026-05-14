'use strict';

const mongoose = require('mongoose')
//require('dotenv').config()

const URL_CONNECT = process.env.URL_CONNECT || 'mongodb://127.0.0.1:27017/musica';

const connectDB = async () => {
  try {
    await mongoose.connect(URL_CONNECT);
    console.log('MongoDB conectado a:', URL_CONNECT);

  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1); //importante para el servidor si falla
  }
};

module.exports = connectDB;