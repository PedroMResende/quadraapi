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
        return res.status(201).json(
            {
                _id: usuarioCriado._id,
                nome: usuarioCriado.nome,
                email: usuarioCriado.email,
                funcao: usuarioCriado.funcao
            }
        ); 
    } catch(err) {
        return res.status(422).json({msg: "Erro na criação"})
    }
}; 

async function listar(req,res) { 
    try {
        const usuariosCadastrados = await Usuario.find({});

        const usuarios = usuariosCadastrados.map(usuario => {
            return {
                _id: usuario._id, 
                nome: usuario.nome,
                email: usuario.email, 
                funcao: usuario.funcao
            }
        })
        return res.status(200).json(usuarios);
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
    return res.status(404).json({msg:"Usuário não encontrado"})
}; 

async function exibir(req,res) {
    const usuario = req.usuario; 
    
    return res.status(200).json(
        {
            _id: usuario._id, 
            nome: usuario.nome, 
            email: usuario.email,
            funcao: usuario.funcao
        }
    );
}; 

async function atualizar(req,res) {
    try {
        const usuarioAtualizado = await Usuario.findOneAndUpdate(
            {_id: req.usuario._id},
            {
                nome: req.body.nome, 
                email: req.body.email, 
            }, 
            {new: true, runValidators: true}
        ); 

        return res.status(200).json(
            {
                _id: usuarioAtualizado._id, 
                nome: usuarioAtualizado.nome, 
                email: usuarioAtualizado.email, 
                funcao: usuarioAtualizado.funcao
            }
        ); 
    } catch(err) { 
        return res.status(422).json({msg: "Erro na atualização: " + err.message}); 
    }
}; 

async function promoverAdmin(req,res) {
    try{
        const usuarioPromovido = await Usuario.findOneAndUpdate(
            {_id: req.usuario._id}, 
            {
                funcao: 'admin'
            }, 
            {
                new: true, 
                runValidators: true
            }
        ); 
        
        return res.status(200).json(
            {
                _id: usuarioPromovido._id, 
                nome: usuarioPromovido.nome, 
                email: usuarioPromovido.email, 
                funcao: usuarioPromovido.funcao
            }
        ); 
    } catch(err) { 
        return res.status(500).json({msg: "Erro ao promover o usuário"})
    }
}

async function remover(req,res) {
    await Usuario.findOneAndDelete({_id: req.usuario._id});
    return res.status(204).end();
}


module.exports = {criar, listar, buscar, exibir, atualizar, promoverAdmin, remover}