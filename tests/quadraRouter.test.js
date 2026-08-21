const supertest = require('supertest'); 
const app = require('../app');
const request = supertest(app);  

const Usuario = require('../models/usuarioModel');

const urlUsuario = '/usuarios';
const urlLogin = '/auth/login'; 
const urlQuadras = '/quadras';


let idAdmin; 
let idUsuario; 
let tokenAdmin; 
let tokenUsuario; 
let idQuadra; 
let idQuadraUrl;


beforeAll(async() => { 
    const adminCriado = await Usuario.create(
        {
            nome: "Admin", 
            email: "admin@teste.com.br",
            senha: '123456',
            funcao: 'admin'
        }
    );

    idAdmin = adminCriado._id; 
    console.log("ADMIN CRIADO COM SUCESSO"); 

    const usuarioCriado = await request.post(urlUsuario)
    .send(
        {
            nome: "João das Neves", 
            email: "joaodasneves@teste.com.br", 
            senha: "joao123"
        }
    ); 

    idUsuario = usuarioCriado.body._id; 
    console.log('USUÁRIO CRIADO COM SUCESSO'); 

    const resAdmin = await request.post(urlLogin)
    .send(
        {
            email: "admin@teste.com.br",
            senha:"123456" 
        }
    ); 
    tokenAdmin = resAdmin.body.token; 
    console.log("ADMIN LOGADO COM SUCESSO"); 

    const resUsuario = await request.post(urlLogin)
    .send(
        {
            email: "joaodasneves@teste.com.br", 
            senha: "joao123"
        }
    ); 
    tokenUsuario = resUsuario.body.token; 
    console.log("USUARIO LOGADO COM SUCESSO");
}); 

describe('TESTES NO RECURSO /quadras', () => {
    test('POST /quadras |DEVE RETORNAR 201|', async() => { 
        const response = await request.post(urlQuadras)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra A", 
                tipo: "Tênis",
                descricao: "Quadra de tênis no térreo",
                preco: 100
            }
        );

        expect(response.status).toBe(201); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined(); 
        expect(response.body.nome).toBe("Quadra A");
        expect(response.body.tipo).toBe("Tênis");
        expect(response.body.descricao).toBe("Quadra de tênis no térreo"); 
        expect(response.body.preco).toBe(100);

        idQuadra = response.body._id;
        idQuadraUrl = `${urlQuadras}/${idQuadra}`
    });

    test('POST /quadras (SEM PASSAR O TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlQuadras)
        .send(
            {
                nome: "Teste", 
                tipo: "Tênis", 
                descricao: "Teste", 
                preco: 100
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Não autorizado");

        console.log(response.body._id)

    }); 

    test('POST /quadras (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlQuadras)
        .set('Authorization', 'Bearer 123456789')
        .send(
            {
                nome: "Teste", 
                tipo: "Tênis", 
                descricao: "Teste", 
                preco: 100
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Token inválido")
    });

    test('POST /quadras (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlQuadras)
        .set('Authorization', `Basic ${tokenAdmin}`)
        .send(
            {
                nome: "Teste", 
                tipo: "Tênis", 
                descricao: "Teste", 
                preco: 100
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Tipo de token inválido");
    }); 

    test('POST /quadras (PASSANDO TOKEN DE USUARIO) |DEVE RETORNAR 403|', async() => { 
        const response = await request.post(urlQuadras)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                nome: "Teste", 
                tipo: "Tênis", 
                descricao: "Teste", 
                preco: 100
            }
        ); 

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Acesso negado, sem permissão");
    });

    test('POST /quadras (NÃO PASSAR NOME) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlQuadras)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "", 
                tipo: "Tênis", 
                descricao: "Testando...", 
                preco: 100
            }
        );

        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Erro na atualização: Quadra validation failed: nome: É obrigatório passar o nome da quadra');
    });

    test('POST /quadras (PASSAR TIPO INVÁLIDO) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlQuadras)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Teste", 
                tipo: "Beach Tennis", 
                descricao: "Testando...", 
                preco: 1000
            }
        );
        
        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Erro na atualização: Quadra validation failed: tipo: `Beach Tennis` is not a valid enum value for path `tipo`.')
    });

    test('POST /quadras (NÃO PASSAR PRECO) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlQuadras)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Testes",
                tipo: "Tênis", 
                descricao: "Testando...", 
                preco: ""
            }
        );

        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Erro na atualização: Quadra validation failed: preco: Obrigatório passar o preço.')
    });

    test('GET /quadras |DEVE RETORNAR 200| -> COM TOKEN ADMIN' , async() => { 
        const response = await request.get(urlQuadras)
        .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(Array.isArray(response.body)).toBe(true); 
    });

    test('GET /quadras |DEVE RETORNAR 200| -> COM TOKEN USUARIO', async() => { 
        const response = await request.get(urlQuadras)
        .set('Authorization' , `Bearer ${tokenUsuario}`)

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(Array.isArray(response.body)).toBe(true);
    }); 

    test('GET /quadras (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlQuadras)
        
        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado')
    }); 

    test('GET /quadras (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlQuadras)
        .set('Authorization', `Bearer 123456789`)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido');
    }); 

    test('GET /quadras (TIPO DE TOKEN INVÁLIDO ADMIN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlQuadras)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    test('GET /quadras (TIPO DE TOKEN INVÁLIDO USUARIO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlQuadras)
        .set('Authorization', `Basic ${tokenUsuario}`);

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    test('GET /quadras/:id |DEVE RETORNAR 200|', async() => { 
        const response = await request.get(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`);
        
        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body._id).toBeDefined(); 
        expect(response.body.nome).toBe('Quadra A'); 
        expect(response.body.tipo).toBe('Tênis');
        expect(response.body.descricao).toBe('Quadra de tênis no térreo'); 
        expect(response.body.preco).toBe(100);
    });

    test('GET /quadras/:id |DEVE RETORNAR 200|', async() => {
        const response = await request.get(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenUsuario}`)

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined(); 
        expect(response.body.nome).toBe('Quadra A');
        expect(response.body.tipo).toBe('Tênis');
        expect(response.body.descricao).toBe('Quadra de tênis no térreo'); 
        expect(response.body.preco).toBe(100);
    });

    test('GET /quadras/:id (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(idQuadraUrl)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado');
    });

    test('GET /quadras/:id (TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(idQuadraUrl)
        .set('Authorization', 'Bearer 123456789')

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido');
    });

    test('GET /quadras/:id (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(idQuadraUrl)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido');
    });

    test('GET /quadras/:id (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401', async() => { 
        const response = await request.get(idQuadraUrl)
        .set('Authorization', `Basic ${tokenUsuario}`)

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    })

    test('GET /quadras/:id (ID INVÁLIDO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.get(`${urlQuadras}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    }); 

    test('GET /quadras/:id (ID INVÁLIDO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.get(`${urlQuadras}/0`)
        .set('Authorization', `Bearer ${tokenUsuario}`)

        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    });

    test('GET /quadras/000000000000000000000000 (ID NAO ENCONTRADO) |DEVE RETORNAR 404|', async() => {
        const response = await request.get(`${urlQuadras}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Quadra não encontrada');
    });


    test('GET /quadras/000000000000000000000000 (ID NAO ENCONTRADO) |DEVE RETORNAR 404|', async() => {
        const response = await request.get(`${urlQuadras}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Quadra não encontrada');
    });

    test('PUT /quadras/:id |DEVE RETORNAR 200|', async() => { 
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra atualizada", 
                tipo: "Society", 
                descricao: "Atualizando a quadra", 
                preco: 120
            } 
        )

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.nome).toBe("Quadra atualizada"); 
        expect(response.body.tipo).toBe("Society"); 
        expect(response.body.descricao).toBe('Atualizando a quadra'); 
        expect(response.body.preco).toBe(120);
    });

    test('PUT /quadras/:id (SEM PASSAR O TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(idQuadraUrl)
        

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Não autorizado')
    }); 

    test('PUT /quadras/:id (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(idQuadraUrl)
        .set('Authorization', 'Bearer 123456789');

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido');
    });

    test('PUT /quadras/:id (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(idQuadraUrl)
        .set('Authorization',`Basic ${tokenAdmin}`);

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido');
    });

    test('PUT /quadras/:id (SEM PERMISSÃO) |DEVE RETORNAR 403', async() => {
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Acesso negado, sem permissão');
    });

    test('PUT /quadras/0 (ID INVÁLIDO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.put(`${urlQuadras}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido');
    });

    test('PUT /quadras/0 (QUADRA NÃO EXISTENTE) |DEVE RETORNAR 404|', async() => { 
        const response = await request.put(`${urlQuadras}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Quadra não encontrada');
    });

    test('PUT /quadras/:id (SEM NOME) |DEVE RETORNAR 422|', async() => {
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "",
                tipo: "Futsal",
                descricao: "Testando...",
                preco: 120
            }
        ); 

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Erro na atualização: Validation failed: nome: É obrigatório passar o nome da quadra");
    }); 

    test('PUT /quadras/:id (TIPO INVÁLIDO) |DEVE RETORNAR 422|', async() => {
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra testando", 
                tipo: "Beach Tennis", 
                descricao: "testando...", 
                preco: 140
            }
        ); 

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Erro na atualização: Validation failed: tipo: `Beach Tennis` is not a valid enum value for path `tipo`.");
    });

    test('PUT /quadras/:id (PREÇO VAZIO) |DEVE RETORNAR 422|', async() => {
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra testando...", 
                tipo: "Futsal", 
                descricao: "testando...", 
                preco: ""
            }
        ); 
        
        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Erro na atualização: Validation failed: preco: Obrigatório passar o preço.");
    });

    test('PUT /quadras/:id (PRECO zero) |DEVE RETORNAR 422|', async() => { 
        const response = await request.put(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra testando...", 
                tipo: "Futsal",
                descricao: "Testando...", 
                preco: 0
            }
        );

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Erro na atualização: Validation failed: preco: O preço deve ser no mínimo 1 real")
    });

    test('DELETE /quadras/:id |DEVE RETORNAR 204|', async() => {
        const response = await request.delete(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(204);
    });

    test('DELETE /quadras/:id (TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(idQuadraUrl)
        .set('Authorization', 'Bearer 123456789');

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Token inválido");
    });

    test('DELETE /quadras/:id (TIPO DE TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(idQuadraUrl)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    test('DELETE /quadras/:id (SEM PERMISSAO) |DEVE RETORNAR 403|', async() => { 
        const response = await request.delete(idQuadraUrl)
        .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Acesso negado, sem permissão');
    }); 

    test('DELETE /quadras/0 (ID INVALIDO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.delete(`${urlQuadras}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    }); 

    test('DELETE /quadras/000000000000000000000000 |DEVE RETORNAR 404|', async() => {
        const response = await request.delete(`${urlQuadras}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Quadra não encontrada')
    })

})