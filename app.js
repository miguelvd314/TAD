const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require("cors");
require ("dotenv").config();

const controlador = require("./controlador/user");

const app = express();
const port = process.env.PORT || 9000;

// Ruta de las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Configura Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));

//middleware
app.use(cors())
app.use(express.json());
app.use('/api', controlador);

//Se declara las views
app.get("/", (req, res)=>{
  res.render("administrador");
});

app.get("/registrar-alumno.html", (req, res)=>{
  res.render("registrar-alumno");
});

app.get("/registrar-curso.html", (req, res)=>{
  res.render("registrar-curso");
});

app.get("/registrar-docente.html", (req, res)=>{
  res.render("registrar-docente");
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
