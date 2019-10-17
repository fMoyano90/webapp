var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario =  require('../models/usuario');
var Empresa =  require('../models/empresa');
var Administrador =  require('../models/administrador');
var Noticia =  require('../models/noticia');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones 

    var tiposValidos = ['usuarios', 'administradores', 'empresas', 'noticias'];
    if( tiposValidos.indexOf( tipo ) < 0 ){
        return res.status(400).json({
            ok: false, 
            mensaje: 'No selecciono nada',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok: false, 
            mensaje: 'No selecciono nada',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Extensiones aceptadas 

    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if( extensionesValidas.indexOf( extensionArchivo ) < 0 ){
        return res.status(400).json({
            ok: false, 
            mensaje: 'La extensión del archivo no es válida',
            errors: {message: 'El formato del archivo no es valido, solo se permiten: ' + extensionesValidas}
        });
    }

    // Asignar un nombre único al archivo
    // En este caso usaremos el id + los 3 milisegundos del momento + la extension del archivo  12315321321563-123.png

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err =>{

        if(err){
            return res.status(500).json({
                ok: false, 
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        // 
        
    })
});

function subirPorTipo( tipo, id, nombreArchivo, res ){

    if(tipo === 'usuarios'){
        Usuario.findById(id, (err, usuario) =>{

            if ( !usuario ){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Usuario no existe',
                    errors: {message: 'El usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen antigua
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            // Subir la imagen nueva
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => { 

                usuarioActualizado.password = ':)';

                if(err){
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al actualizar imagen de usuario',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })
        });
    }

    if(tipo === 'administradores'){
        Administrador.findById(id, (err, administrador) =>{
            
            if ( !administrador ){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Administrador no existe',
                    errors: {message: 'El administrador no existe'}
                });
            }

            var pathViejo = './uploads/administradores/' + administrador.img;

            // Si existe elimina la imagen antigua
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            // Subir la imagen nueva
            administrador.img = nombreArchivo;

            administrador.save((err, administradorActualizado) => {
                if(err){
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al actualizar imagen de administrador',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de administrador actualizada',
                    administrador: administradorActualizado
                });

            })
        });
    }

    if(tipo === 'empresas'){
        Empresa.findById(id, (err, empresa) =>{

            if ( !empresa ){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Empresa no existe',
                    errors: {message: 'La empresa no existe'}
                });
            }

            var pathViejo = './uploads/empresas/' + empresa.img;

            // Si existe elimina la imagen antigua
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            // Subir la imagen nueva
            empresa.img = nombreArchivo;

            empresa.save((err, empresaActualizado) => {
                if(err){
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al actualizar imagen de empresa',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de empresa actualizada',
                    empresa: empresaActualizado
                });

            })
        });
    }

    if(tipo === 'noticias'){
        Noticia.findById(id, (err, noticia) =>{

            if ( !noticia ){
                return res.status(400).json({
                    ok: false, 
                    mensaje: 'Noticia no existe',
                    errors: {message: 'La noticia no existe'}
                });
            }

            var pathViejo = './uploads/noticias/' + noticia.img;

            // Si existe elimina la imagen antigua
            if(fs.existsSync(pathViejo)){
                fs.unlinkSync(pathViejo);
            }

            // Subir la imagen nueva
            noticia.img = nombreArchivo;

            noticia.save((err, noticiaActualizada) => {
                if(err){
                    return res.status(500).json({
                        ok: false, 
                        mensaje: 'Error al actualizar imagen de noticia',
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de noticia actualizada',
                    noticia: noticiaActualizada
                });

            })
        });
    }
}

module.exports = app;