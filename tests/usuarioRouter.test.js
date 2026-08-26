const supertest = require('supertest'); 
const app = require('../app'); 
const request = supertest(app); 

const Usuario = require('../models/usuarioModel');

const urlUsuario = '/usuarios';
const urlAuthLogin = '/auth/login';
const urlAuthRenovar = '/auth/renovar';

let idAdmin ; 
let idUsuario ; 
let tokenAdmin ; 
let tokenUsuario ; 

beforeAll(async() => { 
    const adminCriado = await Usuario.create({
        nome: "Admin", 
        email: "admin@teste.com.br", 
        senha: "123456", 
        funcao: "admin"
    }); 
    idAdmin = adminCriado._id; 

    const usuarioCriado = await request.post(urlUsuario)
    .send(
        {
            nome: "João das Neves",
            email: "joaodasneves@teste.com.br",
            senha: "joao123"
        }
    ); 
    idUsuario = usuarioCriado.body._id

    const resAdmin = await request.post(urlAuthLogin)
    .send({
        email: "admin@teste.com.br",
        senha: "123456"
    }); 
    tokenAdmin = resAdmin.body.token; 

    const resUsuario = await request.post(urlAuthLogin)
    .send({
        email:"joaodasneves@teste.com.br", 
        senha:"joao123"
    }); 
    tokenUsuario = resUsuario.body.token; 
});

describe('TESTES NO RECURSO /usuarios', () => { 
    test('GET /usuarios |DEVE RETORNAR 200|', async() => { 
        const response = await request.get(urlUsuario)
        .set('Authorization', `Bearer ${tokenAdmin}`); 
        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /usuarios (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(urlUsuario); 
        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Não autorizado");
    }); 

    test('GET /usuarios (PASSANDO TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlUsuario)
        .set('Authorization', 'Bearer 123456789'); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido')
    }); 

    test('GET /usuarios (PASSANDO TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(urlUsuario)
        .set('Authorization', `Basic ${tokenAdmin}`); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido');
    }); 

    test('GET/usuarios (PASSANDO USUARIO QUE NÃO É ADMIN |DEVE RETORNAR 403|', async() => { 
        const response = await request.get(urlUsuario)
        .set('Authorization', `Bearer ${tokenUsuario}`); 

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Acesso negado, sem permissão'); 
    });

    test('GET/usuarios/:id |DEVE RETORNAR 200|', async() => {
        const response = await request.get(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined(); 
        expect(response.body.nome).toBe('João das Neves'); 
        expect(response.body.email).toBe('joaodasneves@teste.com.br');
        expect(response.body.funcao).toBe('usuario');
    });

    test('GET /usuarios/:id (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(`${urlUsuario}/${idUsuario}`); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado'); 
    });

    test('GET /usuarios/:id (PASSANDO TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', 'Bearer 123456789'); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido')
    });

    test('GET /usuarios/:id (PASSANDO TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    test('GET/usuarios/:id (PASSANDO USUARIO QUE NÃO É ADMIN |DEVE RETORNAR 403|', async() => {
        const response = await request.get(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenUsuario}`); 

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Acesso negado, sem permissão')
    }); 

    test('GET/usuarios/0 (FORMATO DE ID INVÁLIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.get(`${urlUsuario}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    });

    test('GET /usuarios/000000000000000000000000 (USUARIO INEXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.get(`${urlUsuario}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Usuário não encontrado')
    }); 

    test('PUT /usuario/:id |DEVE RETORNAR 200|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "João Atualizado", 
                email: "emailatualizado@teste.com.br"
            }
        );
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.nome).toBe('João Atualizado');
        expect(response.body.email).toBe('emailatualizado@teste.com.br');
    });

    test('PUT/usuario/:id (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .send(
            {
                nome: "João Atualizado 2", 
                email: "emailatualizado2@teste.com.br"
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Não autorizado")
    }); 

    test('PUT/usuario/:id (TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', 'Bearer 123456789')
        .send(
            {
                nome: "João Atualizado 3",
                email: "emailatualizado3@teste.com.br"
            }
        )

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido');
    }); 

    test('PUT/usuarios/:id (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Basic ${tokenAdmin}`)
        .send(
            {
                nome: "João Atualizado 4", 
                email: "emailatualizado4@teste.com.br"
            }
        )

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido');
    });

    test('PUT/usuarios/:id (PASSANDO USUARIO QUE NÃO É ADMIN |DEVE RETORNAR 403|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                nome: "João Atualizado 5", 
                email: "emailatualizado5@teste.com.br"
            }
        );

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Acesso negado, sem permissão')
    }); 

    test('PUT/usuarios/0 (FORMATO DE ID INVÁLIDO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.put(`${urlUsuario}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "João atualizado 6", 
                email: "emailatualizado6@teste.com.br"
            }
        ); 

        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Parâmetro inválido')
    });

    test('PUT/usuarios/000000000000000000000000 (USUARIO INEXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.put(`${urlUsuario}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
            nome: "João atualizado 7", 
            email: "emailatualizado2@teste.com.br"
        }); 

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Usuário não encontrado")
    });

    test('PUT/usuarios/:id (CORPO INVÁLIDO) |DEVE RETORNAR 422|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "", 
                email: "pedro@teste.com.br"
            }
        )
        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Erro na atualização: Validation failed: nome: O nome do usuário é obrigatório');
    });

    test('PUT/usuarios/:id (CORPO INVÁLIDO) |DEVE RETORNAR 422|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Pedro Resende", 
                email: ""
            }
        ); 

        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Erro na atualização: Validation failed: email: É obrigatório digitar um e-mail')
    });

    test('PUT/usuarios/:id (CORPO INVÁLIDO) |DEVE RETORNAR 422|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "as", 
                email: "pedroresende@teste.com.br"
            }
        );

        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Erro na atualização: Validation failed: nome: O nome do usuário deve ter no mínimo 3 caracteres')
    });

    test('PUT /usuarios/:id (CORPO INVÁLIDO) |DEVE RETORNAR 422|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Pedro Atualizando", 
                email: "jose"
            }
        ); 

        expect(response.status).toBe(422); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Erro na atualização: Validation failed: email: Por favor, informe um email válido.')
    });

    test('PUT /usuarios/:id/promover |DEVE RETORNAR 200|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}/promover`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                funcao: "admin"
            }
        );

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.funcao).toBe('admin')
    });

    test('PUT /usuarios/:id/promover (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}/promover`)
        .send(
            {
                funcao: "admin"
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado')
    });

    test('PUT /usuarios/:id/promover (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}/promover`)
        .set('Authorization', 'Bearer 123456789')
        .send(
            {
                funcao: 'admin'
            }
        ); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido'); 
    }); 

    test('PUT /usuarios/:id/promover (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(`${urlUsuario}/${idUsuario}/promover`)
        .set('Authorization', `Basic ${tokenAdmin}`)
        .send(
            {
                funcao: 'admin'
            }
        );
        
        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 
    
    test('PUT /usuarios/:id/promover (PASSANDO USUARIO QUE NÃO É ADMIN |DEVE RETORNAR 403|', async() => {
        const response = await request.put(`${urlUsuario}/${idUsuario}/promover`)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                funcao: 'admin'
            }
        ); 

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Acesso negado, sem permissão'); 
    }); 

    test('PUT /usuarios/0/promover (FORMATO DE ID INVÁLIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.put(`${urlUsuario}/0/promover`) 
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                funcao: 'admin'
            }
        ); 

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Parâmetro inválido')
    }); 

    test('PUT /usuarios/000000000000000000000000/promover (USUARIO INEXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.put(`${urlUsuario}/000000000000000000000000/promover`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                funcao: 'admin'
            }
        );

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Usuário não encontrado')
    });

    test('DELETE /usuarios/:id |DEVE RETORNAR 204', async() => { 
        const response = await request.delete(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(204); 
    }); 

    test('DELETE /usuarios/:id (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(`${urlUsuario}/${idUsuario}`);

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Não autorizado");
    });

    test('DELETE /usuarios/:id (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.delete(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', 'Bearer 123456789'); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido'); 
    });

    test('DELETE /usuarios/:id (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.delete(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Basic ${tokenAdmin}`); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Tipo de token inválido");
    });

    test('DELETE /usuarios/:id (PASSANDO USUÁRIO QUE NÃO É ADMIN) |DEVE RETORNAR 403|', async() => {
        const response = await request.delete(`${urlUsuario}/${idUsuario}`)
        .set('Authorization', `Bearer ${tokenUsuario}`); 

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Acesso negado, sem permissão");
    }); 

    test('DELETE /usuarios/0 (FORMATO DE ID INVÁLIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.delete(`${urlUsuario}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Parâmetro inválido")
    }); 

    test('DELETE /usuarios/000000000000000000000000 (USUÁRIO NÃO ENCONTRADO) |DEVE RETORNAR 404|', async() => {
        const response = await request.delete(`${urlUsuario}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Usuário não encontrado'); 
    })
}); 




afterAll(async() => { 
    const usuariosRemover = [idUsuario, idAdmin]; 

    for (const id of usuariosRemover) {
        if(id) {
            await Usuario.findOneAndDelete({_id:id});
        }
    }
}); 

