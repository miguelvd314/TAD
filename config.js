const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require("cors");
require ("dotenv").config();

const userRoutes = require("./routes/user");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
const port = process.env.PORT || 9000;

app.set('view engine', 'ejs'); // Usar EJS como motor de plantillas
app.set('views', __dirname + '/views'); // Ruta de las vistas

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));

//middleware
app.use(cors())
app.use(express.json());
app.use('/api', userRoutes);

//Se declara las views
app.get("/", (req, res)=>{
  res.render("html/administrador");
});

app.get("/registrar-alumno.html", (req, res)=>{
  res.render("html/registrar-alumno");
});

app.get("/registrar-curso.html", (req, res)=>{
  res.render("html/registrar-curso");
});

app.get("/registrar-docente.html", (req, res)=>{
  res.render("html/registrar-docente");
});

//mongodb conection
mongoose
.connect(process.env.MONGODB_URI)
.then(() => console.log("Conectado a mongodb atlas"))
.catch((error)=> console.error(error));

app.listen(port, () => console.log('servidor esta funcionando', port));

// const docentesSchema = mongoose.Schema{

// }

const docentesSchema = mongoose.Schema({
    nombre:{
        type: String,
        required:true
    },
    apellido:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    codigo:{
        type: String,
        required:true
    },
    fecha:{
        type: String,
        required:true
    },
    contrasenia:{
        type: String,
        required:true
    },
    recontrasenia:{
        type: String,
        required:true
    }
});

const Docentes = mongoose.model('Docentes', docentesSchema)

//Captura de Datos - JAVASCRIPT
app.use(express.json())

app.post('/api/v1/docentes', (req, res) => {
  const newDocentes = new Docentes(req.body)
  newDocentes.save().then((result) => {
    res.status(201).json({ ok:true })
  }).catch((err) => console.log(err))
})

//Configuracion autenticación Google
// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:9000/auth/google/registrar"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

// // auth google
// app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));
// // Callback auth google
// app.route("/auth/google/crear")
// .get( passport.authenticate('google', { failureRedirect: "/iniciar-sesion" }),
//     function(req, res) { res.redirect("/crear");
// });