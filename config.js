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

//middleware
app.use(cors())
app.use(express.json());
app.use('/api', userRoutes);

//routers
app.get("/", (req, res)=>{
  res.render("registrar");
});

//mongodb conection
mongoose
.connect(process.env.MONGODB_URI)
.then(() => console.log("Conectado a mongodb atlas"))
.catch((error)=> console.error(error));

app.listen(port, () => console.log('servidor esta funcionando', port));

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