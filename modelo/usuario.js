const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  photo: String,
  role: String,
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;