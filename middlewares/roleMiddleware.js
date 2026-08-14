
function autorizarFuncoes(...funcoesPermitidas) {
    return (req,res,next) => { 
        const {funcao} = req.payload; 

        if(!funcoesPermitidas.includes(funcao)) {
            return res.status(403).json(
                {msg: "Acesso negado, sem permissão"}
            )
        }; 

        next(); 
    }
}; 

function autorizarReserva(req,res,next) {

    if(req.payload.funcao === "admin") {
        return next(); 
    }
    if(req.payload.id === req.reserva.usuarioId.toString()) {
        return next();
    }

    return res.status(403).json(
        {msg: "Acesso negado, sem permissão"}
    )

}

module.exports = {autorizarFuncoes, autorizarReserva}