const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const controlador = require('./controlador/user');
const Usuario = require('./modelo/usuario');

const app = express();
const port = process.env.PORT;

// Ruta de las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));

//middleware
app.use(cors());
app.use(express.json());
app.use('/api', controlador);
app.use(session({ secret: process.env.GOOGLE_CLIENT_SECRET, resave: true, saveUninitialized: true }));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar la estrategia de autenticación de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  // Puedes almacenar el perfil del usuario en la base de datos aquí
  try {
    // Busca el usuario en la base de datos por el ID de Google
    const existingUser = await Usuario.findOne({ googleId: profile.id });

    if (existingUser) {
      // Si el usuario ya existe, devuelve el usuario
      return done(null, existingUser);
    }

    // Si el usuario no existe, crea uno nuevo
    const newUser = new Usuario({
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      photo: profile.photos[0].value,
      role: 'alumno',
    });

    // Guarda el nuevo usuario en la base de datos
    await newUser.save();

    // Devuelve el nuevo usuario
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));


// Serializar y deserializar el usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Rutas de autenticación
app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/administrador');
  }
);

// Ruta protegida
app.get('/', (req, res) => {
  res.render('index');
});

// Renderizar la página inicial
app.get('/registrar-docente', async (req, res) => {
  try {
    // Obtén el apellido desde los parámetros de la solicitud
    const { apellido } = req.query;

    // Realiza la búsqueda en la base de datos por apellido
    const resultados = await Usuario.find({ lastName: new RegExp(apellido, 'i') });

    // Renderiza la vista y pasa los resultados a la plantilla
    res.render('registrar-docente', { user: req.user, resultados });
  } catch (error) {
    // Maneja errores si ocurren durante la búsqueda
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/registrar-alumno', (req, res) => {
  res.render('registrar-alumno');
});

app.get('/registrar-curso', (req, res) => {
  res.render('registrar-curso');
});

app.get('/administrador', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('administrador', { user: req.user });
  } else {
    res.redirect('/auth/google');
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

//mongodb conection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a mongodb atlas'))
  .catch((error) => console.error(error));

app.listen(port, () => console.log('El servidor está funcionando', port));