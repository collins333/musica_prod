'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db-connection');
const Disco = require('../src/model/Disco');
const Cancion = require('../src/model/Cancion');

const actualizarPistas = async () => {
try {
await connectDB();

const discos = await Disco.find({});

let totalActualizadas = 0;

for (const disco of discos) {
    console.log(`\n💿 ${disco.titulo}`);
    let contador = 1;

    for(let i=0; i<disco.canciones.length; i++) {
        const cancionId = disco.canciones[i];

        const cancion = await Cancion.findById(cancionId);

        if(!cancion) {
            console.log(`⚠ eliminando referencia rota: ${cancionId}`);

            await Disco.findByIdAndUpdate(disco._id, {
               $pull: {canciones: cancionId} 
            });
            continue;
        }

        // si tiene duración -> es realmente una canción
        if(cancion.dur_cancion && cancion.dur_cancion.trim() !== '') {
            await Cancion.findByIdAndUpdate(cancionId, {
                num_cancion: contador
            });

            console.log(`🎵 ${contador} - ${cancion.tit_cancion}`);

            contador++;

        } else {
            // cabecera / separador
            await Cancion.findByIdAndUpdate(cancionId, {
                num_cancion: null
            });

            console.log(`📚 separador - ${cancion.tit_cancion}`);
        }
        totalActualizadas++;
    }
}
console.log('\n✅ canciones actualizadas:', totalActualizadas);

mongoose.connection.close();

} catch (err) {
console.error('Error:', err)

mongoose.connection.close();
}
};

actualizarPistas();