const mongoose = require('mongoose'); 
const Reserva = require('../models/reservasModel'); 
const Quadra = require('../models/quadrasModel'); 

async function criar(req,res) { 
    
    try {
        const quadraEncontrada = await Quadra.findOne({_id: req.body.quadraId}); 

        //validar se existe a quadra
        if(!quadraEncontrada) {
            return res.status(404).json({msg: "Quadra não encontrada"})
        }; 

        //validar se ela está disponível
        if(quadraEncontrada.disponivel !== true) {
            return res.status(409).json({msg: "Quadra não está disponível"})
        }; 

        const regexHorario = /^([01]\d|2[0-3]):[0-5]\d$/;

        if (!regexHorario.test(req.body.horaInicio)) {
            return res.status(422).json({ msg: "Horário de início inválido" });
        }

        if (!regexHorario.test(req.body.horaFim)) {
            return res.status(422).json({ msg: "Horário de fim inválido" });
        }

        //validar se o horário de início é menor que o horário de final 
        if(req.body.horaInicio >= req.body.horaFim) {
            return res.status(400).json({msg: "O horário de início deve ser menor que o horário de final"})
        }; 

        //verificar conflito de reservas 

        const reservaConflitante = await Reserva.findOne({
            quadraId: req.body.quadraId, 
            data: req.body.data, 
            horaInicio: { $lt: req.body.horaFim}, 
            horaFim: {$gt: req.body.horaInicio}, 
            status: {$ne: 'cancelada'}
        }); 


        if(reservaConflitante) return res.status(409).json({msg: "A quadra já está reservada nesse horário"})
        //a reserva gera um ID, não confunda isso. 
        const reservaCriada = await Reserva.create({
            quadraId: req.body.quadraId, 
            usuarioId: req.payload.id, 
            data: req.body.data,
            horaInicio: req.body.horaInicio, 
            horaFim: req.body.horaFim, 
        }); 
        return res.status(201).json(reservaCriada); 
    } catch(err) {

        if(err.name === 'ValidationError') {
            return res.status(422).json({
                msg: `Erro na criação: ${err.message}`
            });
        }
        return res.status(500).json({msg: "Erro na criação"});
    }
}; 

async function listar(req,res) {
    try{
        const reservasCadastradas = await Reserva.find({}); 
        return res.status(200).json(reservasCadastradas); 
    } catch(err) {
        return res.status(500).json({msg: "DEU RUIM..."})
    }
}

async function tentarBuscar(req,res,next) {

    //aqui é o ID da reserva. 
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({msg:"Parâmetro inválido"});
    }; 

    const reservaEncontrada = await Reserva.findOne({_id: id}); 
    if(reservaEncontrada) {
        req.reserva = reservaEncontrada; 
        return next(); 
    }
    return res.status(404).json({msg: "Reserva não encontrada"}); 
}; 

async function exibir(req,res) {
    return res.status(200).json(req.reserva); 
}; 

async function atualizar(req,res) {
    try {
        const {status} = req.body; 
        
        const statusPermitidos = [
            'confirmada',
            'cancelada'
        ]; 

        if(!statusPermitidos.includes(status)) return res.status(400).json({msg: "Status inválido"}); 

        if(req.reserva.status === 'cancelada'){
            return res.status(409).json({msg: "Uma reserva cancelada não pode ser alterada"})
        }; 

        if(status === 'confirmada' && req.payload.funcao !== 'admin') {
            return res.status(403).json({msg: "Somente administradores podem confirmar reservas"}); 
        }; 

        if(
            status === 'cancelada' && 
            req.payload.funcao !== 'admin' &&
            req.payload.id !== req.reserva.usuarioId.toString()
        ) {
            return res.status(403).json({msg: "Você não pode cancelar esta reserva"})
        }
        const reservaAtualizada = await Reserva.findOneAndUpdate(
            {_id: req.reserva._id}, 
            {
                status: req.body.status
            }, 
            {new:true, runValidators:true}
        ); 
        
        return res.status(200).json(reservaAtualizada); 
    } catch(err) { 
        return res.status(500).json({msg: "Erro na atualização"});
    }
}; 

async function remover(req,res) {
    await Reserva.findOneAndDelete({_id: req.reserva._id}); 
    return res.status(204).end(); 
}

module.exports = { criar, tentarBuscar, exibir, atualizar, remover, listar}