const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

// mostrar login
router.get('/login', (req, res) => {
    res.render('login', {
        error: null,
        title: 'Login admin'
    });
});

// procesar login
// router.post('/login', (req, res) => {
//     const { user, password } = req.body;

//     if(user === process.env.ADMIN_USER) {
//         bcrypt.compare(password, process.env.ADMIN_PASSWORD, (err, result) => {
//             if (result) {
//             req.session.user = user;
//             return res.redirect('/cantantes/1')
//            }

//             res.render('login', {
//                 error: 'Usuario o contraseña incorrectos',
//                 title: 'Login admin'
//             });
//         });
//     } else {
//         res.render('login', {
//             error: 'Usuario o contraseña incorrectos',
//             title: 'Login admin'
//         });
//     };
// });

router.post('/login', (req, res) => {
    const { user, password } = req.body;

    console.log("USER:", user);
    console.log("PASS:", `"${password}"`);
    console.log("ENV HASH:", process.env.ADMIN_PASSWORD);

    if (user === process.env.ADMIN_USER) {
        bcrypt.compare(password, process.env.ADMIN_PASSWORD, (err, result) => {

            console.log("BCRYPT ERROR:", err);
            console.log("BCRYPT RESULT:", result);

            if (result) {
                req.session.user = user;
                return res.redirect('/cantantes/1');
            }

            return res.render('login', {
                error: 'Usuario o contraseña incorrectos',
                title: 'Login admin'
            });
        });
    } else {
        res.render('login', {
            error: 'Usuario o contraseña incorrectos',
            title: 'Login admin'
        });
    }
});

// logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;