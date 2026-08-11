const express = require('express'); 
const router = express.Router(); 


//criar um usuario
router.post('/', usuarioController.criar); 
//listar todos os usuarios ou por ID 
router.get('/', verificarToken, autorizarFuncoes('admin'), usuarioController.listar); 
router.get('/:id', verificarToken, autorizarFuncoes('admin'), usuarioController.buscar, usuarioController.exibir); 

//atualizar dados de um usuario
router.put('/:id', verificarToken, autorizarFuncoes('admin'), usuarioController.buscar, usuarioController.atualizar); 

//deletar um usuario
router.delete('/:id', verificarToken, autorizarFuncoes('admin'),usuarioController.buscar, usuarioController.remover); 



module.exports = router; 