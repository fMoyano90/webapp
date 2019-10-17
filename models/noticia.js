var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var noticiaSchema = new Schema({

	titulo: {type: String, required: true},
	descripcion: { type: String, required: true },
	body: { type: String, required: true },
	tipo: { type: String, required: true },
	img: { type: String, required: false },
    created_at: { type: Date, required: true }
    
},  {collection: 'noticias' });
module.exports = mongoose.model('Noticia', noticiaSchema);
