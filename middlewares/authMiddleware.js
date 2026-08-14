const jwt = require('jsonwebtoken'); 

function gerarToken(payload) {
    try {
        return jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_EXPIRES}
        )
    } catch(err) { 
        throw Error("Erro ao gerar token")
    }
}; 

function verificarToken(req,res,next) {
    const {authorization} = req.headers; 

    if(!authorization) {
        return res.status(401).json({msg: "Não autorizado"})
    }; 
    
    const [tipo, token] = authorization.split(" "); 
    
    if(tipo !== "Bearer" | !token) {
        return res.status(401).json({msg: "Não autorizado"})
    }
    try { 
        req.payload = jwt.verify(token, process.env.JWT_SECRET); 
        next(); 
    } catch(err) {
        return res.status(401).json({msg:"Token inválido."})
    }
}; 

function renovarToken(req,res) {
    try {
        const payload = {
            id: req.payload.id, 
            nome: req.payload.nome, 
            email: req.payload.email,
            funcao: req.payload.funcao
        }; 
        const novoToken = gerarToken(payload);
        return res.status(200).json({token: `${novoToken}`});
    } catch(err) {
        return res.status(500).json({msg:"Erro ao renovar token"})
    }
}

module.exports = {gerarToken, verificarToken, renovarToken}; 