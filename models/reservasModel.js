const mongoose = require('mongoose'); 

const reservaSchema = new mongoose.Schema({
    quadraId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Quadra', 
        required: [true, 'Obrigatório passar o id da Quadra criada.']
    }, 
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: [true, 'Obrigatório passar o id do Usuario criado.']
    }, 
    data: {
        type: Date, 
        required: [true, 'Obrigatório passar uma data'],    
    }, 
    horaInicio: {
        type: String, 
        required: [true, 'É obrigatório passar a hora da reserva'], 
        match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário de início inválido']
    }, 
    horaFim: {
        type: String, 
        required: [true, 'É obrigatório passar a hora fim da reserva'], 
        match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário de início inválido']
    }, 
    status: {
        type: String, 
        enum: ['pendente', 'confirmada', 'cancelada'], 
        default: 'pendente'
    }
}, {
    timestamps: true
}); 

module.exports = mongoose.model('Reserva', reservaSchema)