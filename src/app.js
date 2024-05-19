const path = require('path')
const express = require('express')
const db = require('../src/libs/db-connection')
const morgan = require('morgan')
const methodOverride = require('method-override');
const publicDir = express.static(`${__dirname}/public`);

const app = express()

// importing routes
const cantantesRoutes = require('./routes/cantantes')
const discosRoutes = require('./routes/discos')
const cancionesRoutes = require('./routes/canciones')

// settings
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'));
app.use(publicDir);

// routes
app.use('/', cantantesRoutes)
app.use('/', discosRoutes)
app.use('/', cancionesRoutes)

app.listen(app.get('port'), () => {
  console.log(`server on port ${app.get('port')}`)
})