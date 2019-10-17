var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var graficoSchema = new Schema({

	data: {type: Number, required: true},
	tipo: { type: String, required: true },
	mes: { type: String, required: true },
	anio: { type: Number, required: true },
    empresa_id: { type: String, required: [true, 'El id empresa es un campo obligatorio'] },
    created_at: { type: Date, required: true }
    
});
module.exports = mongoose.model('Grafico', graficoSchema);
