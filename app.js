const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require("cors");
require("dotenv").config();

const controlador = require("./controlador/user");

const app = express();
const port = process.env.PORT;

// Ruta de las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));

//middleware
app.use(cors())
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
}, (accessToken, refreshToken, profile, done) => {
  // Puedes almacenar el perfil del usuario en la base de datos aquí
  return done(null, profile);
}));

// Serializar y deserializar el usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Rutas de autenticación
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Ruta protegida
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("administrador");
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
  .then(() => console.log("Conectado a mongodb atlas"))
  .catch((error) => console.error(error));

app.listen(port, () => console.log('servidor esta funcionando', port));










// const docentesSchema = mongoose.Schema({
//     nombre:{
//         type: String,
//         required:true
//     },
//     apellido:{
//         type: String,
//         required:true
//     },
//     email:{
//         type: String,
//         required:true
//     },
//     codigo:{
//         type: String,
//         required:true
//     },
//     fecha:{
//         type: String,
//         required:true
//     },
//     contrasenia:{
//         type: String,
//         required:true
//     },
//     recontrasenia:{
//         type: String,
//         required:true
//     }
// });

// const Docentes = mongoose.model('Docentes', docentesSchema)

// //Captura de Datos - JAVASCRIPT
// app.use(express.json())

// app.post('/api/v1/docentes', (req, res) => {
//   const newDocentes = new Docentes(req.body)
//   newDocentes.save().then((result) => {
//     res.status(201).json({ ok:true })
//   }).catch((err) => console.log(err))
// })
