const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

let URL_CONNECT = process.env.URL_CONNECT || 'mongodb://127.0.0.1:27017/musica';

let db = mongoose.connect(URL_CONNECT)
  .then(db => console.log('db conectada'))
  .catch(err => console.log(err));

  module.exports = db;