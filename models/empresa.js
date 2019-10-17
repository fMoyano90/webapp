var mongoose =	require('mongoose');

var Schema =	mongoose.Schema;

var empresaSchema = new Schema ({

	nombre: { type: String, required: [true, 'El nombre	es necesario'] },
	categoria: { type: String, required: [true, 'La categoria es necesaria'] },
	img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId,	ref: 'Usuario' }
    
}, {collection: 'empresas' });

module.exports =	mongoose.model('Empresa',	empresaSchema);