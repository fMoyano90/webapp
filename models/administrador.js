var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var administradorSchema = new Schema({

	nombre: { type: String,	required: [true, 'El nombre	es necesario'] },
	img: { type: String, required: false },
	usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresa: { type: Schema.Types.ObjectId, ref: 'Empresa', required: [true, 'El id empresa es un campo obligatorio'] }
    
});
module.exports = mongoose.model('Administrador', administradorSchema);
