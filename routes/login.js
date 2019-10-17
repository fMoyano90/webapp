var express = require('express');
var bcrypt = require('bcryptjs');
var jwt =  require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ======================================
// Login con Google
// ======================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify( token )
                            .catch(e =>{
                                return res.status(403).json({
                                    ok: false,
                                    mensaje: 'Token no valido'
                                });

                            });

    Usuario.findOne( {email:googleUser.email}, (err, usuarioBD) =>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if(usuarioBD){
            
            if(usuarioBD.google === false){ 
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
            });
            } else {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 Horas para expirar token

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu(usuarioBD.role, usuarioBD.empresa_id)
                });

            }

        } else {

            // El usuario no existe, hay que crearlo
            var usuario =  new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 Horas para expirar token

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu(usuarioBD.role, usuarioBD.empresa_id)
                });

            });
        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente',
    //     googleUser: googleUser
    // });

});



// ======================================
// Login normal
// ======================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if( !usuarioBD ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioBD.password ) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear token
        usuarioBD.password = ':)';

        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 Horas para expirar token

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id,
            menu: obtenerMenu(usuarioBD.role,  usuarioBD.empresa_id)
        });

    })

});

function obtenerMenu( ROLE, EMPRESA_ID ) {

    if(EMPRESA_ID === undefined){
        var menu = [
            {
             titulo: 'Principal',
             icono: 'mdi mdi-gauge',
             submenu: [
                { titulo: 'Inicio', url: '/dashboard' },
                { titulo: 'Graficos', url: '/graficas1' },
              ]
            },
            {
              titulo: 'Matenimientos',
              icono: 'mdi mdi-folder-lock-open',
              submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                // { titulo: 'Empresas', url: '/empresas' },
                // { titulo: 'Administradores', url: '/administradores' }
              ]
            }
        
          ];
        
          if ( ROLE === 'ADMIN_ROLE' ) {
            menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
            menu[1].submenu.unshift({ titulo: 'Empresas', url: '/empresas' });
            menu[1].submenu.unshift({ titulo: 'Administradores', url: '/administradores' });
            menu[1].submenu.unshift({ titulo: 'Subir Noticia', url: '/crear-noticia' });
          }
        
        return menu;
        
    } else {
        var empresa = EMPRESA_ID
        var empresa_array = empresa.split(',')

        var menu = [
            {
             titulo: 'Principal',
             icono: 'mdi mdi-gauge',
             submenu: [
                { titulo: 'Inicio', url: '/dashboard' },
                { titulo: 'Graficos', url: '/graficas1/' + empresa_array[0] },
              ]
            }
          ];

          return menu;
    }


    
  
}


module.exports = app;