'use strict';

require('dotenv').config();

const mongoose = require('mongoose');

const connection = require('../src/config/db-connection');

const Cancion = require('../src/model/Cancion');
const Disco = require('../src/model/Disco');

const actualizarInterpretes = async () => {
    try {
        await connection();

        const canciones = await Cancion.find({
            del_interprete: { $exists: false }
        });
        console.log(`canciones encontradas: ${canciones.length}`);

        for (const cancion of canciones) {
            // buscar disco
            const disco = await Disco.findById(cancion.del_disco);

            if (!disco) continue;

            // actualizar canción
            await Cancion.findByIdAndUpdate(cancion._id, {
                del_interprete: disco.interprete
            });
            console.log(`${cancion.tit_cancion}`);
        }
        console.log('migración terminada');
        mongoose.connection.close();

    } catch (err) {
        console.error('Error:', err)
        mongoose.connection.close();
    }
};

actualizarInterpretes();