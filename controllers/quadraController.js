const mongoose = require('mongoose'); 
const Quadra = require('../models/quadrasModel'); 


async function criar(req,res) {
    try{
        const novaQuadra = await Quadra.create(
            {
                nome: req.body.nome, 
                tipo: req.body.tipo,
                descricao: req.body.descricao, 
                preco: req.body.preco, 
                disponivel: true
            }
        ); 
        return res.status(201).json(novaQuadra)
    } catch(err){
        return res.status(422).json({msg: "Erro de criação"})
    }
}; 

async function listar(req,res){
    try{
        const quadrasCadastradas = await Quadra.find({}); 
        return res.status(200).json(quadrasCadastradas); 
    } catch(err) { 
        res.status(500).json({msg: "DEU RUIM..."})
    }
}; 

async function buscar(req,res,next) {
    const {id} = req.params ; 

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({msg:"Parâmetro inválido"})
    }; 

    const quadraEncontrada = await Quadra.findOne({_id: id}); 
    if(quadraEncontrada) {
        req.quadra = quadraEncontrada ; 
        return next();
    }
    return res.status(404).json({msg:"Quadra não encontrada"})
}; 

async function exibir(req,res) {
    return res.status(200).json(req.quadra); 
}

async function atualizar(req,res) {
    try {
        const quadraAtualizada = await Quadra.findOneAndUpdate(
            {_id: req.quadra._id}, 
            {
                nome: req.body.nome, 
                tipo: req.body.tipo, 
                descricao: req.body.descricao, 
                preco: req.body.preco, 
            }, 
            {new: true, runValidators: true}
        ); 
        return res.status(200).json(quadraAtualizada)
    } catch(err) {
        return res.status(422).json({msg: "Erro na atualização"})
    }
}; 

async function remover(req,res) {
    const quadraRemovida = await Quadra.findOneAndDelete(
        {_id: req.quadra._id}
    ); 
    return res.status(204).end(); 
};  

module.exports = { criar, listar, buscar, exibir, atualizar, remover}
