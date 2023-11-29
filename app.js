const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const controlador = require('./controlador/user');
const Usuario = require('./modelo/usuario');
const Curso = require('./modelo/curso');

const app = express();
const port = process.env.PORT;

// Ruta de las vistas
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

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
    // Redirigir según el rol del usuario
    switch (req.user.role) {
      case 'administrador':
        res.redirect('/administrador');
        break;
      case 'docente':
        res.redirect('/docente');
        break;
      case 'alumno':
        res.redirect('/alumno');
        break;
      default:
        // Si el rol no coincide con "administrador", "docente" o "alumno", redirigir a inicio de sesión
        res.redirect('/');
    }
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

app.put('/update-role/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Actualiza el role en la base de datos
    await Usuario.findByIdAndUpdate(userId, { role });

    res.sendStatus(200); // Envía una respuesta de éxito al cliente
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

app.get('/registrar-curso', async (req, res) => {
  try {
    // Obtiene la lista de usuarios con rol "docente"
    const usuarios = await Usuario.find({ role: 'docente' }, 'lastName');

    res.render('registrar-curso', { user: req.user, usuarios });
  } catch (error) {
    console.error(error);
    res.send('Error al obtener la lista de docentes.');
  }
});

app.post('/registrar-curso', (req, res) => {
  const nuevoCurso = new Curso({
    nombreCurso: req.body.nombreCurso,
    dia: req.body.dia,
    hora: req.body.hora,
    docente: req.body.docente,
    vacantes: req.body.vacantes,
    precio: req.body.precio
  });

  nuevoCurso.save()
  .then(() => {
    res.send('Curso registrado correctamente.');
  })
  .catch((err) => {
    console.error(err);
    res.send('Error al guardar el curso.');
  });
});

// app.get('/alumno', (req, res) => {
//   res.render('alumno', { user: req.user });
// });

app.get('/alumno', async (req, res) => {
  try {
    // Consulta todos los cursos disponibles
    const cursos = await Curso.find().populate('docente', 'displayName');

    res.render('alumno', { user: req.user, cursos });
  } catch (error) {
    console.error(error);
    res.send('Error al obtener la información de los cursos.');
  }
});

app.post('/matricular', async (req, res) => {
  try {
    const { cursoId } = req.body;
    const userId = req.user._id;

    // Busca el curso por su _id
    const curso = await Curso.findById(cursoId);

    if (!curso) {
      return res.status(404).send('Curso no encontrado.');
    }

    // Verifica si hay vacantes disponibles
    if (curso.vacantes <= 0) {
      return res.status(400).send('No hay vacantes disponibles en este curso.');
    }

    // Verifica si el usuario ya está matriculado en este curso
    if (curso.matriculas.includes(userId)) {
      return res.status(400).send('Ya estás matriculado en este curso.');
    }

    // Agrega el _id del usuario a la lista de matriculados en el curso
    curso.matriculas.push(userId);

    // Disminuye las vacantes disponibles
    curso.vacantes--;

    await curso.save();

    res.send('¡Te has matriculado correctamente!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al matricularse en el curso.');
  }
});

app.get('/docente', (req, res) => {
  res.render('docente', { user: req.user });
});

app.get('/administrador', (req, res) => {
  // Verificar si el usuario está autenticado
  if (req.isAuthenticated()) {
    // Redirigir según el rol del usuario
    switch (req.user.role) {
      case 'administrador':
        res.render('administrador', { user: req.user });
        break;
      case 'docente':
        res.render('docente', { user: req.user });
        break;
      case 'alumno':
        res.render('alumno', { user: req.user });
        break;
      default:
        // Si el rol no coincide con "administrador", "docente" o "alumno", redirigir a inicio de sesión
        res.redirect('/auth/google');
    }
  } else {
    // Redirigir a la página de inicio de sesión si no está autenticado
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