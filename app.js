// Requires 
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');

// Inicializar variables 
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });

// Body Parser
// parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var empresaRoutes = require('./routes/empresa');
var administradorRoutes = require('./routes/administrador');
var graficoRoutes = require('./routes/grafico');
var noticiaRoutes = require('./routes/noticia');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión a la BD 
mongoose.connection.openUri('mongodb://localhost:27017/dashboardDB', (err, res) => {

    if(err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');

});

// Rutas 
app.use('/usuario', usuarioRoutes);
app.use('/empresa', empresaRoutes);
app.use('/administrador', administradorRoutes);
app.use('/grafico', graficoRoutes);
app.use('/noticia', noticiaRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

// Escuchar peticiones 

app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m','online');
})