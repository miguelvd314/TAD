const express = require("express");
const docentesSchema = require("../modelo/user");

const router = express.Router();

//crear usuario
router.post('/users', (req, res) =>{
    const  user = docentesSchema(req.body);
    user
    .save()
    .then((data) => res.json(data))
    .catch((error)=> res.json({message: error}));
});

//obtener todos los usuarios
router.get('/users', (req, res) =>{
    docentesSchema
    .find()
    .then((data) => res.json(data))
    .catch((error)=> res.json({message: error}));
});

//obtener un usuario en especifico
router.get('/users/:id', (req, res) =>{
    const { id } = req.params;
    docentesSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error)=> res.json({message: error}));
});

//Actualizar usuario
router.put('/users/:id', (req, res) =>{
    const { id } = req.params;
    const {correo, contraseña} = req.body;
    docentesSchema
    .updateOne({ _id: id},{ $set: {correo, contraseña}})
    .then((data) => res.json(data))
    .catch((error)=> res.json({message: error}));
});

//Eliminar usuario
router.delete('/users/:id', (req, res) =>{
    const { id } = req.params;
    docentesSchema
    .deleteOne({ _id: id})
    .then((data) => res.json(data))
    .catch((error)=> res.json({message: error}));
});

module.exports = router;