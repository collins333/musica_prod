const express = require('express');
const router = express.Router()

// mostrar login
router.get('/login', (req, res) => {
    res.render('login', {
        error: null
    });
});

// procesar login
router.post('/login', (req, res) => {
    const { user, password } = req.body;

    if(user === 'admin' && password === '1234') {
        req.session.user = user;
        return res.redirect('/cantantes/1')
    };

    //res.redirect('/');
    res.render('Login', {
        error: 'Usuario o contraseña incorrectos'
    });
});

// logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;