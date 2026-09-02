🏟️ QuadraAPI

API REST para gerenciamento de quadras esportivas, usuários e reservas, desenvolvida com Node.js, Express e MongoDB.

O projeto foi desenvolvido com foco em boas práticas de desenvolvimento de APIs REST, autenticação e autorização utilizando JWT, validação de dados, tratamento de erros e testes automatizados.

⸻

🚀 Tecnologias

* Node.js
* Express
* MongoDB
* Mongoose
* JWT (JSON Web Token)
* Jest
* Supertest
* Swagger / OpenAPI
* Nodemon

⸻

📌 Funcionalidades

👤 Usuários

* Cadastro de usuários
* Login
* Consulta de usuários
* Consulta de usuário por ID
* Atualização de usuário
* Exclusão de usuário
* Promoção de usuário para administrador
* Controle de acesso baseado em função

🏟️ Quadras

* Cadastro de quadras
* Consulta de quadras
* Consulta de quadra por ID
* Atualização de quadras
* Exclusão de quadras
* Controle de disponibilidade
* Controle de acesso para operações administrativas

📅 Reservas

* Criação de reservas
* Consulta de reservas
* Consulta de reserva por ID
* Cancelamento de reservas
* Confirmação de reservas por administradores
* Validação de horários
* Verificação de disponibilidade da quadra
* Prevenção de conflitos entre reservas
* Controle de acesso às reservas

⸻

🔐 Autenticação e autorização

A API utiliza JWT (JSON Web Token) para autenticação.

Após realizar o login, o cliente recebe um token que deve ser enviado nas requisições protegidas através do header:

Authorization: Bearer SEU_TOKEN

A API possui dois níveis principais de acesso:

Função	Permissões
usuario	Operações permitidas ao usuário comum e gerenciamento das próprias reservas
admin	Operações administrativas e gerenciamento geral dos recursos

Exemplo

GET /reservas
Authorization: Bearer eyJhbGciOiJIUzI1Ni...

Requisições sem autenticação retornam:

{
  "msg": "Não autorizado"
}

Tokens inválidos retornam:

{
  "msg": "Token inválido"
}

E tokens enviados utilizando um esquema diferente de Bearer retornam:

{
  "msg": "Tipo de token inválido"
}

⸻

📚 Endpoints

🔑 Autenticação

POST /auth/login

Realiza o login de um usuário e retorna um JWT.

Exemplo:

{
  "email": "usuario@teste.com.br",
  "senha": "usuario123"
}

⸻

POST /auth/renovar

Responsável pela renovação do token de autenticação.

⸻

👤 Usuários

POST /usuarios

Cria um novo usuário.

Exemplo:

{
  "nome": "João das Neves",
  "email": "joao@teste.com.br",
  "senha": "joao123"
}

⸻

GET /usuarios

Lista os usuários.

🔒 Acesso: administrador.

⸻

GET /usuarios/:id

Busca um usuário específico.

🔒 Acesso: administrador.

⸻

PUT /usuarios/:id

Atualiza os dados de um usuário.

🔒 Acesso: administrador.

Exemplo:

{
  "nome": "João Atualizado",
  "email": "joaoatualizado@teste.com.br"
}

⸻

PUT /usuarios/:id/promover

Promove um usuário para administrador.

🔒 Acesso: administrador.

Exemplo:

{
  "funcao": "admin"
}

⸻

DELETE /usuarios/:id

Remove um usuário.

🔒 Acesso: administrador.

⸻

🏟️ Quadras

POST /quadras

Cria uma nova quadra.

🔒 Acesso: administrador.

Exemplo:

{
  "nome": "Quadra A",
  "tipo": "Futsal",
  "descricao": "Quadra de futsal no primeiro andar",
  "preco": 100
}

⸻

GET /quadras

Lista as quadras cadastradas.

⸻

GET /quadras/:id

Busca uma quadra específica.

⸻

PUT /quadras/:id

Atualiza os dados de uma quadra.

🔒 Acesso: administrador.

Exemplo:

{
  "nome": "Quadra A",
  "tipo": "Futsal",
  "descricao": "Quadra reformada",
  "preco": 100,
  "disponivel": true
}

⸻

DELETE /quadras/:id

Remove uma quadra.

🔒 Acesso: administrador.

⸻

📅 Reservas

POST /reservas

Cria uma nova reserva.

🔒 Acesso: usuário autenticado.

Exemplo:

{
  "quadraId": "64f...",
  "usuarioId": "64f...",
  "data": "2026-08-30",
  "horaInicio": "08:30",
  "horaFim": "10:30"
}

A API verifica:

* existência da quadra;
* disponibilidade da quadra;
* validade dos horários;
* ordem dos horários;
* conflitos com outras reservas.

⸻

GET /reservas

Lista as reservas.

🔒 Acesso: usuário autenticado.

Administradores possuem acesso geral às reservas, enquanto usuários comuns ficam sujeitos às regras de autorização da aplicação.

⸻

GET /reservas/:id

Busca uma reserva específica.

🔒 Acesso: usuário autenticado.

Administradores podem consultar qualquer reserva.

Usuários comuns podem consultar somente reservas às quais possuem permissão de acesso.

⸻

PUT /reservas/:id

Atualiza o status de uma reserva.

Exemplo:

{
  "status": "confirmada"
}

Os status utilizados pela aplicação incluem:

* pendente
* confirmada
* cancelada

Administradores podem confirmar reservas.

Usuários comuns podem cancelar suas próprias reservas.

Uma reserva cancelada não pode ser alterada posteriormente.

⸻

DELETE /reservas/:id

Remove uma reserva.

Administradores podem remover reservas.

Usuários comuns podem remover suas próprias reservas, respeitando as regras de autorização da aplicação.

Em caso de sucesso, a API retorna:

204 No Content

⸻

⚠️ Tratamento de erros

A API utiliza códigos HTTP para representar diferentes situações.

Status	Significado
200	Operação realizada com sucesso
201	Recurso criado com sucesso
204	Operação realizada sem conteúdo para retornar
400	Parâmetro ou requisição inválida
401	Usuário não autenticado / token inválido
403	Usuário autenticado, mas sem permissão
404	Recurso não encontrado
409	Conflito com o estado atual do recurso
422	Dados enviados não passaram pelas validações

Exemplos

Recurso não encontrado

{
  "msg": "Usuário não encontrado"
}

Acesso negado

{
  "msg": "Acesso negado, sem permissão"
}

Quadra indisponível

{
  "msg": "Quadra não está disponível"
}

Conflito de reserva

{
  "msg": "A quadra já está reservada nesse horário"
}

⸻

🧪 Testes

O projeto possui testes automatizados utilizando Jest e Supertest.

Os testes verificam tanto o comportamento esperado das rotas quanto cenários de erro e autorização.

Entre os cenários testados estão:

* criação de usuários;
* autenticação;
* autenticação sem token;
* token inválido;
* tipo de token inválido;
* autorização de administradores;
* autorização de usuários comuns;
* IDs inválidos;
* recursos inexistentes;
* criação de quadras;
* disponibilidade de quadras;
* criação de reservas;
* horários inválidos;
* conflitos de horários;
* confirmação de reservas;
* cancelamento de reservas;
* tentativa de alteração de reserva cancelada;
* exclusão de reservas;
* validação dos dados enviados;
* códigos HTTP e mensagens de erro.

Para executar os testes:

npm test

⸻

📖 Swagger / OpenAPI

A API possui documentação utilizando Swagger/OpenAPI, permitindo visualizar e testar os endpoints diretamente pela interface de documentação.

Após iniciar a aplicação, acesse a rota configurada para a documentação Swagger.

Na interface do Swagger, endpoints protegidos podem ser utilizados através do botão Authorize, informando o JWT no formato:

Bearer SEU_TOKEN

⸻

⚙️ Configuração do projeto

1. Clone o repositório

git clone <URL_DO_REPOSITORIO>

Entre na pasta:

cd QuadraAPI

⸻

2. Instale as dependências

npm install

⸻

3. Configure as variáveis de ambiente

Crie um arquivo .env na raiz do projeto.

Exemplo:

PORT=3000
MONGODB_URI=sua_string_de_conexao
JWT_SECRET=sua_chave_secreta

Os nomes das variáveis devem corresponder às utilizadas na configuração da aplicação.

⸻

4. Inicie o servidor

Modo desenvolvimento:

npm run dev

Ou:

npm start

caso esteja configurado no package.json.

⸻

🗂️ Estrutura do projeto

Uma possível organização do projeto:

QuadraAPI/
│
├── controllers/
│   ├── usuarioController.js
│   ├── quadraController.js
│   ├── reservaController.js
│   └── authController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── ...
│
├── models/
│   ├── usuarioModel.js
│   ├── quadrasModel.js
│   └── reservasModel.js
│
├── routes/
│   ├── usuarioRoutes.js
│   ├── quadraRoutes.js
│   ├── reservaRoutes.js
│   └── authRoutes.js
│
├── tests/
│   ├── usuario.test.js
│   ├── reserva.test.js
│   └── ...
│
├── app.js
├── server.js
├── package.json
├── .env
└── README.md

⸻

🧠 Objetivo do projeto

O QuadraAPI foi desenvolvido como um projeto prático para aplicação de conceitos de desenvolvimento Back-End, incluindo:

* criação de APIs REST;
* arquitetura baseada em rotas, controllers e models;
* persistência de dados com MongoDB;
* modelagem utilizando Mongoose;
* autenticação utilizando JWT;
* autorização baseada em funções;
* validação de dados;
* tratamento de erros HTTP;
* testes automatizados;
* documentação de API com Swagger/OpenAPI;
* utilização de Git e GitHub durante o desenvolvimento.

⸻

📌 Status do projeto

🚧 Em desenvolvimento

O projeto está sendo desenvolvido de forma incremental, com novas funcionalidades, melhorias de validação, testes e documentação sendo adicionados ao longo do desenvolvimento.

⸻

👨‍💻 Autor

Pedro Medeiros Resende

Projeto desenvolvido para prática e aprofundamento em desenvolvimento Back-End com Node.js.