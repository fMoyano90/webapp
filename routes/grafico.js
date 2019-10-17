var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Grafico = require('../models/grafico');

// ======================================
// Obtener todos los graficos
// ======================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Grafico.find({})
        .skip(desde)
        .limit(5)
        .populate('empresa')
        .exec(
        (err, graficos)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando graficos',
                errors: err
            });
        }

        Grafico.count({}, (err, conteo) => {

            res.status(200).json({
                ok: true,
                graficos: graficos,
                total: conteo
            });

        });
    })
});

// ======================================
// Obtener grafico por empresa y tipo
// ======================================

app.get('/:empresa_id/:tipo', (req, res, next) => {

    var desde = req.query.desde || 0;
    var tipo = req.params.tipo;
    var empresa = req.params.empresa_id;
    desde = Number(desde);

    Grafico.find({"empresa_id": empresa, "tipo": tipo})
        // .where('empresa_id', empresa)
        .sort({
            created_at: 'desc'
        })
        .skip(desde)
        .limit(3)
        .exec(
        (err, grafico)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando grafico',
                errors: err
            });
        }
            res.status(200).json({
                ok: true,
                grafico: grafico
            });

        })
});


// ======================================
// Crear un nuevo grafico
// ======================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var ahora = new Date();
    var anio = ahora.getFullYear();
    var mes = parseInt(ahora.getMonth()) + 1; 

    var grafico = new Grafico({
        data: body.data,
        tipo: body.tipo,
        empresa_id: body.empresa_id,
        mes: mes,
        anio: anio,
        created_at: ahora
    });

    grafico.save( (err, graficoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear grafico',
                errors: err
            });
        }
        
        res.status(201).json({
            ok: true,
            grafico: graficoGuardado    
        });
    });
});

// ======================================
// Actualizar grafico
// ======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Grafico.findById( id, (err, grafico) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar grafico',
                errors: err
            });
        }

        if( !grafico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El grafico con el id ' + id + 'no existe.',
                errors: { message: 'No existe un grafico con ese ID' }
            });
        }

        grafico.labels = body.labels,
        grafico.data = body.data,
        grafico.type = body.type,
        grafico.leyenda = body.leyenda,
        grafico.empresa = body.empresa

        grafico.save((err, graficoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar grafico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                grafico: graficoGuardado
            });

        });
        
    });

});

// ======================================
// Borrar un grafico segun su id
// ====================================== 

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

   var id = req.params.id;
   Grafico.findByIdAndRemove(id, (err, graficoBorrado) => {
       
      if (err) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al borrar grafico',
              errors: err
          });
      } 

      if ( !graficoBorrado ) {
          return res.status(400).json({
              ok: false,
              mensaje: 'No existe un grafico con ese id',
              errors: { message: 'No existe ningun grafico con ese id' }
          });
      }
      
      res.status(200).json({
          ok: true,
          grafico: graficoBorrado
      });

   });

});

module.exports = app;
