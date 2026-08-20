const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; 

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String, 
        required: [true, 'O nome do usuário é obrigatório'], 
        trim: true, 
        minlength:[3, 'O nome do usuário deve ter no mínimo 3 caracteres']
    }, 
    email: {
        type: String,
        required: [true, 'É obrigatório digitar um e-mail'], 
        // unique: true, -> Colocar o unique no final 
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, informe um email válido.']
    }, 
    senha: {
        type: String, 
        required: [true, 'É obrigatório digitar uma senha.'], 
    }, 
    funcao: {
        type: String, 
        enum: ['usuario', 'admin'],
        required: [true, 'É obrigatório passar a função.']
    }
}, {
    timestamps: true
}
); 

usuarioSchema.pre('save', async function() {
    if(!this.isModified('senha')) return ; 

    try {
        const hashed = await bcrypt.hash(this.senha, SALT_ROUNDS); 
        this.senha = hashed; 
    } catch(err){
        throw(err); 
    }
})

module.exports = mongoose.model('Usuario', usuarioSchema);