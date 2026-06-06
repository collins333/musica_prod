'use strict';

const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const mongoose = require('mongoose');

const Interprete = require('../src/model/Interprete');
const Disco = require('../src/model/Disco');
const { URL_CONNECT } = require('../src/config/db-connection');

async function limpiarInfos() {
  try {
    console.log('Conectando a la base de datos...');

    await mongoose.connect(URL_CONNECT);
    console.log('Conexión establecida con éxito');

    console.log('\nIniciando limpieza de intérpretes...');
    const interpretes = await Interprete
      .find({
          info: {
            $exists: true
          }
      });
    let contInterpretes = 0;

    for (let interprete of interpretes) {
      if (interprete.info) {
        const infoLimpia = interprete.info.trim();
        
        await Interprete.updateOne(
          {_id: interprete._id},
          { $set: { info: infoLimpia }}
        );
        contInterpretes++;
      }
    }
    console.log(`Se han limpiado ${contInterpretes} interpretes.`);

    console.log('\nIniciando limpieza de discos...');
    const discos = await Disco
      .find({
        info: {
          $exists: true
        }
      });
    let contDiscos = 0;

    for (let disco of discos) {
      if (disco.info) {
        const infoLimpia = disco.info.trim();

        await Disco.updateOne(
          { _id: disco._id },
          { $set: { info: infoLimpia }}
        );
        contDiscos++;
      }
    }
    console.log(`Se han limpiado ${contDiscos} discos.`);

    console.log('Migración completada con éxito');
  } catch (err) {
    console.error('Hubo un error durante la migración:', err);
  }finally {
    await mongoose.disconnect();
    console.log('Conexión cerrada de forma segura');
  }
}

limpiarInfos();