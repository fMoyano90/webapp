var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Administrador = require('../models/administrador');

// ======================================
// Obtener todos los administradores
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Administrador.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('empresa')
        .exec(
        (err, administradores)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando administradores',
                errors: err
            });
        }

        Administrador.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                administradores: administradores,
                total: conteo
            });

        });
    })
});

// ======================================
// Obterne administrador
// ======================================

app.get('/:id', (req, res) => {
    var id= req.params.id;

    Administrador.findById( id )
            .populate('usuario', 'nombre email img')
            .populate('empresa')
            .exec((err, administrador) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar administrador',
                        errors: err
                    });
                }
        
                if( !administrador ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El administrador con el id ' + id + 'no existe.',
                        errors: { message: 'No existe un administrador con ese ID' }
                    });
                }

                return res.status(200).json({
                    ok: true,
                    administrador: administrador
                });

            })
});


// ======================================
// Crear una nuevo administrador
// ======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var administrador = new Administrador({
        nombre: body.nombre,
        usuario: req.usuario._id,
        empresa: body.empresa
    });

    administrador.save( (err, administradorGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear administrador',
                errors: err
            });
        }
        
        res.status(201).json({
            ok: true,
            administrador: administradorGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ======================================
// Actualizar administrador
// ======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Administrador.findById( id, (err, administrador) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar administrador',
                errors: err
            });
        }

        if( !administrador ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El administrador con el id ' + id + 'no existe.',
                errors: { message: 'No existe un administrador con ese ID' }
            });
        }

        administrador.nombre = body.nombre;
        administrador.usuario = req.usuario._id;
        administrador.empresa = body.empresa;

        administrador.save((err, administradorGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar administrador',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                administrador: administradorGuardado
            });

        });
        
    });

});

// ======================================
// Borrar un usuario por el id
// ====================================== 

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

   var id = req.params.id;
   Administrador.findByIdAndRemove(id, (err, administradorBorrado) => {
       
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar administrador',
              errors: err
          });
      } 

      if ( !administradorBorrado ) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe un administrador con ese id',
              errors: { message: 'No existe ningun administrador con ese id' }
          });
      }
      
      res.status(200).json({
          ok: true,
          administrador: administradorBorrado
      });

   });

});

module.exports = app;
