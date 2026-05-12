'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const connection = require('../src/config/db-connection');

const Disco = require('../src/model/Disco');

const convertir = async () => {
    try {
        await connection();

        const result = await Disco.updateMany({
                anyo: { $type: "string" }
            },
            [
                {
                    $set: {
                        anyo: { $toInt: "$anyo" }
                    }
                }
            ]
        );

        console.log('Documentos modificados:', result.modifiedCount);

        console.log('conversión terminada');
        mongoose.connection.close();

    } catch (err) {
        console.error('Error:', err);
        mongoose.connection.close();
    }
};

convertir();