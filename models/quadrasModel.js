const mongoose = require('mongoose'); 

const quadraSchema = new mongoose.Schema({
    nome: {
        type: String, 
        required: [true, 'É obrigatório passar o nome da quadra'], 
        trim:true, 
        // unique: true, -> Validar no fim dos testes testes
    }, 
    tipo: {
        type: String,
        required: [true, 'É obrigatório passar um tipo válido de quadra.'], 
        trim:true, 
        enum: ['Futsal', 'Vôlei', 'Tênis','Society']
    }, 
    descricao: {
        type: String
    }, 
    preco: {
        type: Number, 
        required: [true, 'Obrigatório passar o preço.'], 
        min: [1, 'O preço deve ser no mínimo 1 real'], 
    }, 
    disponivel: {
        type: Boolean, 
        default: true,
    }

}, {
    timestamps: true
}); 

module.exports = mongoose.model('Quadra', quadraSchema); 