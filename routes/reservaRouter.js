const express = require('express'); 
const router = express.Router(); 


//criar uma reserva
router.post('/', verificarToken, reservaController.criar); 

//ver disponibilidade de reservas 
router.get('/', verificarToken, reservaController.listar); 
router.get('/:id', verificarToken, autorizarReserva, reservaController.buscar, reservaController.exibir); 

//atualizar o status de uma reserva
router.put('/:id', verificarToken, autorizarReserva, reservaController.buscar, reservaController.atualizar); 

//excluindo uma reserva
router.delete('/:id', verificarToken, autorizarReserva, reservaController.buscar, reservaController.remover); 




module.exports = router; 
