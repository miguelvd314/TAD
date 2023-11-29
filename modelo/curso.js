const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nombreCurso: String,
  dia: String,
  hora: String,
  docente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  vacantes: Number,
  precio: String,
  matriculas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  ]
});

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso;
