const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const asyncHandler = require('../middlewares/asyncHandler');

// mostrar login
router.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    title: "Login admin",
  });
});

// procesar login
router.post("/login", asyncHandler(async (req, res, next) => {
  const { user, password } = req.body;
    
  // validamos el nombre del usuario administrativo
  if (user === process.env.ADMIN_USER) {
    // comparamos la contraseña de forma asíncrona
    const esCorrecto = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);

    if (esCorrecto) {
      req.session.user = user;

      // forzamos a que la sesión se guarde en MongoDBAtlas antes de redirigir
      return req.session.save((err) => {
        // si hay un error de BD, va a errorHandler
        if (err) return next(err);
        res.redirect('/cantantes');
      });
    }
  }

  // un solo punto de salida si el usuario o la contraseña fallan
  res.render("login", {
    error: "Usuario o contraseña incorrectos",
    title: "Login admin",
  });
}));

// logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    // una vez destruída la sesión, limpiamos las cookies
    res.clearCookie('connect.sid');
    res.redirect("/login");
  });
});

module.exports = router;
