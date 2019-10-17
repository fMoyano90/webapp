var express = require('express');

var app = express();

var Empresa = require('../models/empresa');
var Administrador = require('../models/administrador');
var Usuario = require('../models/usuario');

// ======================================
// Busqueda por colección
// ======================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp ( busqueda, 'i' );

    Promise.all( [ 
        buscarEmpresas(busqueda, regex), 
        buscarAdministradores(busqueda, regex),
        buscarUsuarios(busqueda, regex) 
        ] )
        .then( respuestas => {

            if(tabla === 'empresa'){
                res.status(200).json({
                    ok: true,
                    empresas: respuestas[0]
                });
            }
            if(tabla === 'administrador'){
                res.status(200).json({
                    ok: true,
                    administradores: respuestas[1]
                });
            }
            if(tabla === 'usuario'){
                res.status(200).json({
                    ok: true,
                    usuarios: respuestas[2]
                });
            }
            else{
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Los tipos de busqueda son: usuario, empresa y administrador',
                    error: { message: 'Tipo de tabla invalida' }
                });
            }
        })
});

// ======================================
// Busqueda general
// ======================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i' );

    Promise.all( [ 
        buscarEmpresas(busqueda, regex), 
        buscarAdministradores(busqueda, regex),
        buscarUsuarios(busqueda, regex) 
        ] )
        .then( respuestas => {

            res.status(200).json({
                ok: true,
                empresas: respuestas[0],
                administradores: respuestas[1],
                usuarios: respuestas[2]
            });

        })
});

// ======================================
// Promesas
// ======================================
function buscarEmpresas ( busqueda, regex ){

    return new Promise (( resolve, reject ) => {

    Empresa.find({nombre: regex})
           .populate('usuario', 'nombre email img')
           .exec((err, empresas) => {
        if(err){
            reject('Error al cargar empresas', err);
        }else{
            resolve(empresas)
        }
    });
  });
}

function buscarAdministradores ( busqueda, regex ){

    return new Promise (( resolve, reject ) => {

    Administrador.find({nombre: regex})
                 .populate('usuario', 'nombre email img')
                 .populate('empresa')
                 .exec((err, administradores) => {
        if(err){
            reject('Error al cargar empresas', err);
        }else{
            resolve(administradores)
        }
    });
  });
}

function buscarUsuarios ( busqueda, regex ){

    return new Promise (( resolve, reject ) => {

    Usuario.find({}, 'nombre email role img')
            .or([ { 'nombre': regex }, { 'email': regex }  ])
            .exec((err, usuarios)=>{
                if(err){
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })
  });
}

module.exports = app;