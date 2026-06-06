"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env")});
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const helmet = require('helmet');
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const { connectDB, URL_CONNECT } = require("./config/db-connection");

const app = express();

connectDB();

// SETTINGS
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("trust proxy", 1);

// MIDDLEWARES
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: URL_CONNECT,
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
      secure: false,
    },
  }),
);

// pasar usuario a las vistas ejs
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// IMPORTANDO RUTAS
const cantantesRoutes = require("./routes/cantantes");
const discosRoutes = require("./routes/discos");
const cancionesRoutes = require("./routes/canciones");
const authRoutes = require("./routes/auth");

// RUTAS
app.use("/", cantantesRoutes);
app.use("/", discosRoutes);
app.use("/", cancionesRoutes);
app.use(authRoutes);

// manejo de errores centralizado
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
