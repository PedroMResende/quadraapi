const express = require('express'); 
const router = express.Router(); 


router.post('/login', AuthController.login); 
router.post('/renovar', verificarToken, renovarToken); 






module.exports = router





