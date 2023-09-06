const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    correo: {
        type: String,
        required: true
    },
    contraseña: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);