var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Empresa = require('../models/empresa');

// ======================================
// Obtener todas las empresas 
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Empresa.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
        (err, empresas)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        Empresa.count({},(err, conteo) => {
            
            res.status(200).json({
                ok: true,
                empresas: empresas,
                total: conteo
            });

        });
    })
});

// ======================================
// Obtener Empresa por ID 
// ======================================

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Empresa.findById(id)
            .populate('usuario', 'nombre categoria img email')
            .exec((err, empresa) =>{
                
                if (err) {
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al buscar empresa',
                        errors: err
                    });
                }

                if (!empresa) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'La empresa con el ' + id + 'no existe',
                        errors: { message: 'No existe la empresa con ese ID' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    empresa: empresa
                });
            })
})

// ======================================
// Crear una nueva empresa
// ======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var empresa = new Empresa({
        nombre: body.nombre,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    empresa.save( (err, empresaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear empresa',
                errors: err
            });
        }
        
        res.status(201).json({
            ok: true,
            empresa: empresaGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ======================================
// Actualizar usuario
// ======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Empresa.findById( id, (err, empresa) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar empresa',
                errors: err
            });
        }

        if( !empresa ){
            return res.status(400).json({
                ok: false,
                mensaje: 'La empresa con el id ' + id + 'no existe.',
                errors: { message: 'No existe una empresa con ese ID' }
            });
        }

        empresa.nombre = body.nombre;
        empresa.categoria = body.categoria;
        empresa.usuario = req.usuario._id;

        empresa.save((err, empresaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar empresa',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                empresa: empresaGuardado
            });

        });
        
    });

});

// ======================================
// Borrar un usuario por el id
// ====================================== 

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

   var id = req.params.id;
   Empresa.findByIdAndRemove(id, (err, empresaBorrado) => {
       
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar empresa',
              errors: err
          });
      } 

      if ( !empresaBorrado ) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe una empresa con ese id',
              errors: { message: 'No existe ninguna empresa con ese id' }
          });
      }
      
      res.status(200).json({
          ok: true,
          empresa: empresaBorrado
      });

   });

});

module.exports = app;
