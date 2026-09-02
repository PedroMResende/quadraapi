const express = require('express'); 
const YAML = require('yaml'); // Permite ler e interpretar arquivos .yaml (usado pra documentação do Swagger)
const fs = require('fs'); //  Módulo nativo do Node.js pra manipular arquivos (ler, escrever, etc.)
const swaggerUi = require('swagger-ui-express'); //  Middleware que exibe a documentação interativa do Swagger na interface web

//carregar o arquivo swagger.yaml
const file =fs.readFileSync("./swagger.yaml", "utf8"); 

//valida o formato YAML 
const swaggerDoc = YAML.parse(file); 

//cria o middleware de rotas
const router = express.Router(); 


//carrega a aplicação do swagger UI 
router.use('/', swaggerUi.serve); 

//renderizar a documentação
router.get('/', swaggerUi.setup(swaggerDoc))


module.exports = router
