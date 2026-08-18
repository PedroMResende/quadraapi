const express = require('express'); 
const router = express.Router(); 

const quadraController = require('../controllers/quadraController'); 
const {verificarToken} = require('../middlewares/authMiddleware');
const {autorizarFuncoes} = require('../middlewares/roleMiddleware');

//criar uma quadra
router.post('/', verificarToken, autorizarFuncoes('admin'), quadraController.criar); 

//ver quadras criadas e por id
router.get('/', verificarToken, quadraController.listar);
router.get('/:id', verificarToken, quadraController.buscar, quadraController.exibir); 

//atualizar as infos de uma quadra
router.put('/:id', verificarToken, autorizarFuncoes('admin'), quadraController.buscar, quadraController.atualizar); 

//deletar uma quadra do sistema 
router.delete('/:id', verificarToken, autorizarFuncoes('admin'), quadraController.buscar, quadraController.remover); 


module.exports = router; 