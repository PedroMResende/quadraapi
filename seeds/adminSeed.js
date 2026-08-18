const mongoose = require('mongoose'); 
const Usuario = require('../models/usuarioModel'); 
require('dotenv').config(); 


const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DBNAME}`;

async function criarAdmin() {
    try {
        await mongoose.connect(url); 

        const adminExistente = await Usuario.findOne({email:'admin@quadra.com'}); 

        if(adminExistente) {
            console.log('Admin já existente'); 
            return
        }

        await Usuario.create({
            nome: 'Administrador', 
            email: 'admin@quadra.com', 
            senha: '123456', 
            funcao: 'admin'
        }); 

        console.log('admin criado com sucesso'); 
    } catch(err) { 
        console.error('Erro ao criar admin: ', err); 
    } finally {
        await mongoose.disconnect(); 
    }
}; 

criarAdmin(); 