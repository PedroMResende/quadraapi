const supertest = require('supertest');
const app = require('../app');
const request = supertest(app); 

const Usuario = require('../models/usuarioModel');

const urlUsuario = '/usuarios'; 
const urlLogin = '/auth/login'; 
const urlRenovar = '/auth/renovar'; 

let idAdmin ; 
let idUsuario; 
let tokenAdmin; 
let tokenUsuario; 
let tokenAdminNovo; 
let tokenUsuarioNovo; 


beforeAll(async() => { 
    const adminCriado = await Usuario.create(
        {
            nome: "Admin", 
            email: "admin@teste.com.br", 
            senha: "123456", 
            funcao: "admin"
        }
    );
    idAdmin = adminCriado._id;

    const usuarioCriado = await request.post(urlUsuario)
    .send(
        {
            nome: "Usuario", 
            email: "usuario@teste.com.br", 
            senha: "usuario123"
        }
    );
    idUsuario = usuarioCriado.body._id;

    const resAdmin = await request.post(urlLogin)
    .send(
        {
            email: "admin@teste.com.br", 
            senha: "123456"
        }
    )
    tokenAdmin = resAdmin.body.token; 
    
    const resUsuario = await request.post(urlLogin)
    .send(
        {
            email: "usuario@teste.com.br", 
            senha: "usuario123"
        }
    );
    tokenUsuario = resUsuario.body.token;
}); 


describe('TESTES NA ROTA /auth', () => {
    
    test('PUT /auth/renovar COMO ADMIN |DEVE RETORNAR 200|', async() => {
        const response = await request.post(urlRenovar)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                id: idAdmin,
                nome: "Admin", 
                email: 'admin@teste.com.br', 
                funcao: 'admin'
            }
        ); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        tokenAdminNovo = response.body.token; 
        expect(tokenAdminNovo).toBeDefined(); 
        expect(response.body.renovar).toBe("Renovou!")
        })

    test('PUT /auth/renovar (COMO USUARIO) |DEVE RETORNAR 200|', async() => { 
        const response = await request.post(urlRenovar)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                id: idUsuario,
                nome: "Usuario", 
                email: 'usuario@teste.com.br', 
                funcao: 'usuario123'
            }
        );
        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/);
        tokenUsuarioNovo = response.body.token; 
        expect(tokenUsuarioNovo).toBeDefined(); 
        expect(response.body.renovar).toBe("Renovou!");
    });

    test('PUT /auth/renovar (SEM TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlRenovar); 

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Não autorizado")
    }); 

    test('PUT /auth/renovar (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlRenovar)
        .set('Authorization', `Bearer 1234567789`); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Token inválido');
    }); 

    test('PUT /auth/renovar (TIPO DE TOKEN INVÁlIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlRenovar)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    
    
    });

    

afterAll(async() => {
    const usuariosRemovidos = [idAdmin, idUsuario]; 

    for (const id of usuariosRemovidos) {
        if(id) {
            await Usuario.findOneAndDelete({_id:id})
        }
    }; 
})  