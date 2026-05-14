'use strict';

require('dotenv').config()
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const methodOverride = require('method-override');
const session = require('express-session');
const connectDB = require('./config/db-connection')

const app = express()

// IMPORTANDO RUTAS
const cantantesRoutes = require('./routes/cantantes')
const discosRoutes = require('./routes/discos')
const cancionesRoutes = require('./routes/canciones')
const authRoutes = require('./routes/auth');

// SETTINGS
app.set('port', process.env.PORT || 4000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// MIDDLEWARES
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'musica_app_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// RUTAS
app.use('/', cantantesRoutes);
app.use('/', discosRoutes);
app.use('/', cancionesRoutes);
app.use(authRoutes);

connectDB();

app.listen(app.get('port'), () => {
  console.log(`server on port ${app.get('port')}`)
});