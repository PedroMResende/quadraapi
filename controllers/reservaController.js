const mongoose = require('mongoose'); 
const Reserva = require('../models/reservasModel'); 

async function criar(req,res) { 
    try {
        const reservaCriada = await Reserva.create({
            quadraId: req.body.quadraId, 
            usuarioId: req.body.usuarioId, 
            data: req.body.data,
            horaInicio: req.body.horaInicio, 
            horaFim: req.body.horaFim, 
            status: "pendente"
        }); 

        return res.status(201).json(reservaCriada); 
    } catch(err) {
        return res.status(422).json({msg: "Erro na criação"})
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

async function buscar(req,res,next) {
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
        const reservaAtualizada = await Reserva.findOneAndUpdate(
            {_id: req.reserva._id}, 
            {
                status: req.body.status
            }, 
            {new:true, runValidators:true}
        ); 
        
        return res.status(200).json(reservaAtualizada); 
    } catch(err) { 
        return res.status(422).json({msg: "Erro na atualização"});
    }
}; 

async function remover(req,res) {
    await Reserva.findOneAndDelete({_id: req.reserva._id}); 
    return res.status(204).end(); 
}

module.exports = { criar, buscar, exibir, atualizar, remover, listar}