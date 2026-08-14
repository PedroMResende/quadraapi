const Usuario = require('../models/usuarioModel'); 
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/authMiddleware'); 

async function login(req,res) {
    try{
        const {email,senha} = req.body; 
    
        const usuario = await Usuario.findOne({email:email});
        if(!usuario) {
            return res.status(401).json({msg:"Email ou senha inválido"}); 
        };
    
        const senhaValida = await bcrypt.compare(senha, usuario.senha); 
        if(!senhaValida){
            return res.status(401).json({msg:"Email ou senha inválido"})
        };
    
        const payload = {
            id: usuario._id, 
            nome: usuario.nome, 
            email: usuario.email, 
            funcao: usuario.funcao
        }; 
    
        const token = authMiddleware.gerarToken(payload);
        
        return res.status(200).json({token: `${token}`});
    } catch(err) {
        return res.status(500).json({msg: "Erro interno do servidor"})
    }
};

module.exports ={login}