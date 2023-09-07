const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', docentesSchema);