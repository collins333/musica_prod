require('dotenv').config();
const mongoose = require('mongoose');

const Cancion = require('../src/model/Cancion');

const URL_CONNECT = process.env.URL_CONNECT || 'mongodb://127.0.0.1:27017/musica';

mongoose.connect(URL_CONNECT)
    .then(async () => {
        console.log('conectado a mongoDB');

        const resultado = await Cancion.updateMany(

        {},
        {
            $set: {
                num_cancion: null
            }
        });

        console.log('canciones actualizadas:', resultado.modifiedCount);

        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
    }); 