const express = require('express'); 
const router = express.Router(); 

const AuthController = require('../controllers/authController'); 
const {verificarToken, renovarToken} = require('../middlewares/authMiddleware'); 


router.post('/login', AuthController.login); 
router.post('/renovar', verificarToken, renovarToken); 






module.exports = router





