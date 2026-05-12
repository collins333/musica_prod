require('dotenv').config();

const mongoose = require('mongoose');
const Disco = require('../src/model/Disco');

const URL_CONNECT = process.env.URL_CONNECT;

mongoose.connect(URL_CONNECT)
    .then(async () => {
        console.log('Conectado a MongoDB');

        const resultado = await Disco.updateMany(
            { esAudioLocal: { $exists: false }},
            { $set: { esAudioLocal: false } }
        );

        console.log('Discos actualizados:', resultado.modifiedCount);

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error:', err);
    });