const express = require('express'); 
const router = express.Router(); 

const {verificarToken} = require('../middlewares/authMiddleware'); 
const reservaController = require('../controllers/reservaController');
const {autorizarReserva} = require('../middlewares/roleMiddleware');


//criar uma reserva
router.post('/', verificarToken, reservaController.criar); 

//ver disponibilidade de reservas 
router.get('/', verificarToken, reservaController.listar); 
router.get('/:id', verificarToken, reservaController.tentarBuscar, autorizarReserva, reservaController.exibir); 

//atualizar o status de uma reserva
router.put('/:id', verificarToken, reservaController.tentarBuscar, autorizarReserva, reservaController.atualizar); 

//excluindo uma reserva
router.delete('/:id', verificarToken, reservaController.tentarBuscar, autorizarReserva, reservaController.remover); 




module.exports = router; 
