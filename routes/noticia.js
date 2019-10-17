var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Noticia = require('../models/noticia');

// ======================================
// Obtener todas las noticias 
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Noticia.find({})
        .sort({
            created_at: 'desc'
        })
        .skip(desde)
        .limit(6)
        .exec(
        (err, noticias)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando noticias',
                errors: err
            });
        }

        Noticia.count({},(err, conteo) => {
            
            res.status(200).json({
                ok: true,
                noticias: noticias,
                total: conteo
            });

        });
    })
});

// ======================================
// Obtener todas las noticias principales
// ======================================

app.get('/principales', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Noticia.find({})
        .where('tipo').equals('PRINCIPAL')
        .sort({
            created_at: 'desc'

        })
        .skip(desde)
        .limit(1)
        .exec(
        (err, principales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando noticias principales',
                errors: err
            });
        }

        Noticia.count({})
        .where('tipo').equals('PRINCIPAL')
        .exec((err, conteo) => {

            res.status(200).json({
                ok: true,
                principales: principales,
                total: conteo,
            });

        })
    })
});


// ======================================
// Obtener todas las noticias normales
// ======================================

app.get('/normales', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Noticia.find({})
        .where('tipo').equals('NORMAL')
        .sort({
            created_at: 'desc'
        })
        .skip(desde)
        .limit(3)
        .exec(
        (err, normales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando noticias normales',
                errors: err
            });
        }

        Noticia.count({})
        .where('tipo').equals('NORMAL')
        .exec((err, conteo) => {

            res.status(200).json({
                ok: true,
                normales: normales,
                total: conteo,
            });

        })
    })
});

// ======================================
// Crear una nueva noticia
// ======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var ahora = new Date();

    var noticia = new Noticia({
        titulo: body.titulo,
        descripcion: body.descripcion,
        body: body.body,
        tipo: body.tipo,
        created_at: ahora
    });

    noticia.save( (err, noticiaGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear noticia',
                errors: err
            });
        }
        
        res.status(201).json({
            ok: true,
            noticia: noticiaGuardado,
            usuariotoken: req.usuario
        });
    });
});


// ======================================
// Obtener Noticia por ID 
// ======================================

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Noticia.findById(id)
            .exec((err, noticia) =>{
                
                if (err) {
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al buscar noticia',
                        errors: err
                    });
                }

                if (!noticia) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'La noticia con el ' + id + 'no existe',
                        errors: { message: 'No existe la noticia con ese ID' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    noticia: noticia
                });
            })
})

// ======================================
// Actualizar noticia
// ======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Noticia.findById( id, (err, noticia) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar noticia',
                errors: err
            });
        }

        if( !noticia ){
            return res.status(400).json({
                ok: false,
                mensaje: 'La noticia con el id ' + id + 'no existe.',
                errors: { message: 'No existe una noticia con ese ID' }
            });
        }

        noticia.titulo = body.titulo,
        noticia.descripcion = body.descripcion,
        noticia.body = body.body,
        noticia.tipo = body.tipo,

        noticia.save((err, noticiaGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar noticia',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                noticia: noticiaGuardado
            });

        });
        
    });

});

// ======================================
// Borrar una noticia por su id
// ====================================== 

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

   var id = req.params.id;
   Noticia.findByIdAndRemove(id, (err, noticiaBorrado) => {
       
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar noticia',
              errors: err
          });
      } 

      if ( !noticiaBorrado ) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe una noticia con ese id',
              errors: { message: 'No existe ninguna noticia con ese id' }
          });
      }
      
      res.status(200).json({
          ok: true,
          empresa: noticiaBorrado
      });

   });

});




module.exports = app;
