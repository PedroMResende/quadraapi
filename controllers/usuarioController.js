const mongoose = require('mongoose'); 
const Usuario = require('../models/usuarioModel'); 

async function criar(req,res){
    try {
        const usuarioCriado = await Usuario.create(
            {
                nome: req.body.nome, 
                email: req.body.email, 
                senha: req.body.senha, 
                funcao: "usuario"
            }
        ); 
        return res.status(201).json(usuarioCriado); 
    } catch(err) {
        return res.status(422).json({msg: "Erro na criação"})
    }
}; 

async function listar(req,res) { 
    try {
        const usuariosCadastrados = await Usuario.find({});
        return res.status(200).json(usuariosCadastrados);
    } catch(err) {
        return res.status(500).json({msg: "DEU RUIM...."})
    }
}; 

async function buscar(req,res, next) {
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({msg: "Parâmetro inválido"})
    };

    const usuarioEncontrado = await Usuario.findOne({_id:id}); 

    if(usuarioEncontrado) {
        req.usuario = usuarioEncontrado ; 
        return next(); 
    }; 
    return res.status(404).json({msg:"Usuario não encontrado"})
}; 

async function exibir(req,res) {
    return res.status(200).json(req.usuario);
}; 

async function atualizar(req,res) {
    try {
        const usuarioAtualizado = await Usuario.findOneAndUpdate(
            {_id: req.usuario._id},
            {
                nome: req.body.nome, 
                email: req.body.email, 
                senha: req.body.senha, 
            }, 
            {new: true, runValidators: true}
        ); 

        return res.status(200).json(usuarioAtualizado); 
    } catch(err) { 
        return res.status(422).json({msg: "Erro na atualização"}); 
    }
}; 

async function remover(req,res) {
    await Usuario.findOneAndDelete({_id: req.usuario._id});
    return res.status(204).end();
}


module.exports = {criar, listar, buscar, exibir, atualizar, remover}