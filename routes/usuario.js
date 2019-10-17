var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


// ======================================
// Obtener todos los usuarios
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google empresa_id')
        .populate('nombre_empresa')
        .skip(desde)
        .limit(5)
        .exec(
        (err, usuarios)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo,
            });

        })
    })
});

// ======================================
// Obtener todos los usuarios administradores
// ======================================

app.get('/administradores', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google empresa_id')
        .where('role').equals('ADMINISTRADOR')
        .populate('nombre_empresa')
        .skip(desde)
        .limit(5)
        .exec(
        (err, administradores)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando administradores',
                errors: err
            });
        }

        Usuario.count({})
        .where('role').equals('ADMINISTRADOR')
        .exec((err, conteo) => {

            res.status(200).json({
                ok: true,
                administradores: administradores,
                total: conteo,
            });

        })
    })
});

// ======================================
// Obtener todos los usuarios encargados del sistema
// ======================================

app.get('/usuarios', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google empresa_id')
        .where('role', ['ADMIN_ROLE', 'USER_ROLE'])
        .skip(desde)
        .limit(5)
        .exec(
        (err, usuarios)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Usuario.count({})
        .where('role', ['ADMIN_ROLE', 'USER_ROLE'])
        .exec((err, conteo) => {

            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo,
            });

        })
    })
});

// ======================================
// Obtener usuario
// ======================================

app.get('/:id', (req, res) => {
    var id= req.params.id;

    Usuario.findById( id )
            .populate('usuario')
            .populate('nombre_empresa')
            .exec((err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: err
                    });
                }
        
                if( !usuario ){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario con el id ' + id + 'no existe.',
                        errors: { message: 'No existe un usuario con ese ID' }
                    });
                }

                usuario.password = ':)';

                return res.status(200).json({
                    ok: true,
                    usuario: usuario
                });
                
            })
});



// ======================================
// Crear un nuevo usuario
// ======================================

app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        empresa_id: body.empresa_id,
        img: body.img,
    });

    usuario.save( (err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }
        
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ======================================
// Actualizar usuario
// ======================================

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario], (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (err, usuario) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe.',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
        
    });

});

// ======================================
// Borrar un usuario por el id
// ====================================== 

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE], (req, res) => {

   var id = req.params.id;
   Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
       
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar usuario',
              errors: err
          });
      } 

      if ( !usuarioBorrado ) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe un usuario con ese id',
              errors: { message: 'No existe ningun usuario con ese id' }
          });
      }
      
      res.status(200).json({
          ok: true,
          usuario: usuarioBorrado
      });

   });

});

module.exports = app;