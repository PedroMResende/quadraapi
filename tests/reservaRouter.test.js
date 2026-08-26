const supertest = require('supertest'); 
const app = require('../app');
const request = supertest(app); 

const Usuario = require('../models/usuarioModel');
const Quadra = require('../models/quadrasModel');
const Reserva = require('../models/reservasModel');

const urlUsuario = '/usuarios'; 
const urlLogin = '/auth/login';
const urlQuadra = '/quadras';
const urlReserva = '/reservas'; 


let reserva1; 
let idUrlReserva ;
let idUsuario; 
let idUsuarioNaoAutorizado;
let idAdmin; 
let idQuadra; 
let idQuadraIndisponivel;
let idReserva; 

let tokenUsuario; 
let tokenUsuarioNaoAutorizado;
let tokenAdmin; 

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
    
        const usuarioCriado2 = await request.post(urlUsuario)
        .send(
            {
                nome: "Usuario Não autorizado", 
                email: "usuarionaoautorizado@teste.com.br", 
                senha: "usuarionaoautorizado"
            }
        );
        idUsuarioNaoAutorizado = usuarioCriado2.body._id;
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

        const resUsuarioNaoAutorizado = await request.post(urlLogin)
        .send(
            {
                email: "usuarionaoautorizado@teste.com.br", 
                senha: "usuarionaoautorizado"
            }
        );
        tokenUsuarioNaoAutorizado = resUsuarioNaoAutorizado.body.token;

        const quadraCriada = await request.post(urlQuadra)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra A", 
                tipo: "Futsal", 
                descricao: "Quadra de futsal no primeiro andar", 
                preco: 100
            }
        ); 

        idQuadra = quadraCriada.body._id; 

        const quadraCriadaIndisponivel = await request.post(urlQuadra)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                nome: "Quadra Indisponivel", 
                tipo: "Vôlei", 
                descricao: "Quadra disponivel por enquanto", 
                preco: 100
            }
        ); 

        idQuadraIndisponivel = quadraCriadaIndisponivel.body._id;

        const quadraAtualizada = await request.put(`${urlQuadra}/${idQuadraIndisponivel}`)
            .set('Authorization',`Bearer ${tokenAdmin}`)
            .send(
                {
                    nome: "Quadra Indisponivel",
                    tipo: "Vôlei", 
                    descricao: "Quadra indisponível -> Cagaram no chão",
                    preco: 100,
                    disponivel: false
                }
            )
        ;

        idQuadraIndisponivel = quadraAtualizada.body._id;

}); 

describe('TESTES NA ROTA /reservas', () => {

    test('POST /reservas (USUARIO) => |DEVE RETORNAR 201|', async() => { 

        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId : idQuadra, 
                usuarioId : idUsuario, 
                data: "2026-08-30",
                horaInicio: "08:30",
                horaFim: "10:30"
            }
        ); 

        expect(response.status).toBe(201); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.quadraId).toBeDefined(); 
        expect(response.body.usuarioId).toBeDefined(); 
        expect(response.body.data).toBe("2026-08-30T00:00:00.000Z");
        expect(response.body.horaInicio).toBe("08:30");
        expect(response.body.horaFim).toBe("10:30");
        
        idReserva =  response.body._id;
        idUrlReserva = `/reservas/${idReserva}`;
        reserva1 = response.body;
    });

    test('POST /reservas (USUARIO 2) |DEVE RETORNAR 201|', async() => { 
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuarioNaoAutorizado}`)
        .send(
            {
                quadraId: idQuadra, 
                usuarioId: idUsuarioNaoAutorizado, 
                data: '2026-08-28',
                horaInicio: '08:30',
                horaFim: '10:30'
            }
        );

        idReserva2 = response.body._id; 
        idUrlReserva2 = `/reservas/${idReserva2}`;
        reserva2 = response.body;
    })

    test('POST /reservas (SEM TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.post(urlReserva);

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado');
    }); 

    test('POST /reservas (TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlReserva)
        .set('Authorization', 'Bearer 12345678');

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido'); 
    }); 

    test('POST /reservas (TIPO DE TOKEN INVÁLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.post(urlReserva)
        .set('Authorization', `Basic ${tokenUsuario}`);

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido');
    });

    test('POST /reservas (QUADRA INEXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: "000000000000000000000000",
                usuarioId: idUsuario,
                data: "2026-08-30", 
                horaInicio: "08:30",
                horaFim: "10:30"
            }
        );
        
        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Quadra não encontrada')
    });

    test('POST /reservas (QUADRA INDISPONIVEL) |DEVE RETORNAR 409|', async() => { 
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadraIndisponivel, 
                usuarioId: idUsuario, 
                data: "2026-08-30",
                horaInicio: "08:30", 
                horaFim: "10:30"
            }
        ); 

        expect(response.status).toBe(409); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Quadra não está disponível')
    });

    test('POST /reservas (HORÁRIO INVÁLIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                quadraId : idQuadra, 
                usuarioId: idUsuario,
                data: '2026-08-29', 
                horaInicio: '09:30', 
                horaFim: "07:30"
            }
        );

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('O horário de início deve ser menor que o horário de final');
    });

    test('POST /reservas (QUADRA JÁ RESERVADA) |DEVE RETORNAR 409', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadra, 
                usuarioId: idUsuario, 
                data: '2026-08-30',
                horaInicio: '08:30',
                horaFim: '10:30'
            }
        );

        expect(response.status).toBe(409); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('A quadra já está reservada nesse horário');
    });


    test('POST /reservas (HORA DE INÍCIO INVÁLIDA) |DEVE RETORNAR 422|', async() => {
    const response = await request.post(urlReserva)
    .set('Authorization', `Bearer ${tokenUsuario}`)
    .send(
        {
            quadraId: idQuadra,
            usuarioId: idUsuario,
            data: "2026-08-30",
            horaInicio: "banana",
            horaFim: "10:30"
        }
    );

    expect(response.status).toBe(422);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.msg).toBe(
        'Horário de início inválido'
    );
});


    test('POST /reservas (HORA DE FIM INVÁLIDA) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadra,
                usuarioId: idUsuario,
                data: "2026-08-30",
                horaInicio: "08:30",
                horaFim: "banana"
            }
        );

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe(
            'Horário de fim inválido'
        );
    });


    test('POST /reservas (HORA DE INÍCIO IMPOSSÍVEL) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadra,
                usuarioId: idUsuario,
                data: "2026-08-30",
                horaInicio: "25:00",
                horaFim: "10:30"
            }
        );

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe(
            'Horário de início inválido'
        );
    });


    test('POST /reservas (HORA DE FIM IMPOSSÍVEL) |DEVE RETORNAR 422|', async() => {
        const response = await request.post(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadra,
                usuarioId: idUsuario,
                data: "2026-08-30",
                horaInicio: "08:30",
                horaFim: "08:75"
            }
        );

        expect(response.status).toBe(422);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe(
            'Horário de fim inválido'
        );
    });

    test('GET /reservas (COMO ADMIN) |DEVE RETORNAR 200', async() => { 
        const response = await request.get(urlReserva)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /reservas (COMO USUARIO) |DEVE RETORNAR 200|', async() => { 
        const response = await request.get(urlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(Array.isArray(response.body)).toBe(true); 
    }); 

    test('GET /reservas (SEM PASSAR TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.get(urlReserva); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado');
    });

    test('GET /reservas (TOKEN INVÄLIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlReserva)
        .set('Authorization', 'Bearer 123456789'); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Token inválido");
    }); 

    test('GET /reservas (TIPO DE TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(urlReserva)
        .set('Authorization', `Basic ${tokenUsuario}`); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Tipo de token inválido');
    }); 

    test('GET /reservas/:id (COMO ADMIN)  |DEVE RETORNAR 200|', async() => { 
        const response = await request.get(idUrlReserva)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined(); 
        expect(response.body.quadraId).toBeDefined(); 
        expect(response.body.usuarioId).toBeDefined(); 
    });

    test('GET /reservas/:id (COMO USUARIO QUE FEZ A RESERVA)  |DEVE RETORNAR 200|', async() => {
        const response = await request.get(idUrlReserva) 
        .set('Authorization', `Bearer ${tokenUsuario}`); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined(); 
        expect(response.body.quadraId).toBeDefined(); 
        expect(response.body.usuarioId).toBeDefined(); 

    });

    test('GET /reservas/:id (SEM TOKEN) |DEVE RETORNAR 401', async() => { 
        const response = await request.get(idUrlReserva); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado');
    }); 

    test('GET /reservas/:id (TOKEN INVALIDO) |DEVE RETORNAR 401', async() => { 
        const response = await request.get(idUrlReserva)
        .set('Authorization', 'Bearer 123456789')

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido');
    });

    test('GET /reservas/:id (TIPO DE TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => { 
        const response = await request.get(idUrlReserva)
        .set('Authorization', `Basic ${tokenUsuario}`);

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido'); 
    }); 

    test('GET /reservas/0 (ID INVALIDO) |DEVE RETORNAR 400', async() => { 
        const response = await request.get(`${urlReserva}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    }); 

    test('GET /reservas/000000000000000000000000 (ID VALIDO MAS NAO EXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.get(`${urlReserva}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`); 

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Reserva não encontrada"); 
    });

    test('GET /reservas/:id (USUARIO NAO AUTORIZADO) |DEVE RETORNAR 403|', async() => { 
        const response = await request.get(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuarioNaoAutorizado}`)

        expect(response.status).toBe(403); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Acesso negado, sem permissão');
    });

    test('PUT /reservas/:id (ADMIN CONFIRMA RESERVA) |DEVE RETORNAR 200|', async() => {
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                ...reserva1,
                status: 'confirmada'
            }
        );

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body._id).toBeDefined();
        expect(response.body.status).toBe('confirmada')
    });

    test('PUT /reservas/:id (USUARIO COMUM TENTA CONFIRMAR) |DEVE RETORNAR 403|', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                ...reserva1, 
                status: 'confirmada'
            }
        );
        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Somente administradores podem confirmar reservas')
    });

    test('PUT /reservas/:id (USUARIO CANCELA A PROPRIA RESERVA |DEVE RETORNAR 200|', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                ...reserva1, 
                status: 'cancelada'
            }
        ); 

        expect(response.status).toBe(200); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body._id).toBeDefined();
        expect(response.body.status).toBe('cancelada')
    }); 

    test('PUT /reservas/:id (USUARIO TENTA CANCELAR OUTRA RESERVA) |DEVE RETORNAR 403|', async() => { 
        const response = await request.put(idUrlReserva2)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                status: 'cancelada'
            }
        );

        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Acesso negado, sem permissão')
    });

    test('PUT /reservas/:id (STATUS INVALIDO - ADMIN) |DEVE RETORNAR 400|', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(
            {
                ...reserva1, 
                status: 'banana'
            }
        ); 

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Status inválido'); 
    }); 

    test('PUT /reservas/:id (STATUS INVALIDO - USUARIO) |DEVE RETORNAR 400|', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                ...reserva1, 
                status: 'banana'
            }
        ); 

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Status inválido'); 
    });

    test('PUT /reservas/:id (ALTERAR RESERVA JA CANCELADA) |DEVE RETORNAR 409|', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                ...reserva1, 
                status: 'confirmada'
            }
        ); 

        expect(response.status).toBe(409); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Uma reserva cancelada não pode ser alterada')
    });

    test('PUT /reservas/:id (SEM TOKEN) |DEVE RETORNAR 401|', async() => { 
        const response = await request.put(idUrlReserva); 

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Não autorizado');
    }); 

    test('PUT /reservas/:id (TOKEN INVALIDO) |DEVE RETORNAR 401', async() => { 
        const response = await request.put(idUrlReserva)
        .set('Authorization', 'Bearer 1234567789')
        

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe("Token inválido")
    }); 

    test('PUT /reservas/:id (TIPO DE TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.put(idUrlReserva)
        .set('Authorization', `Basic ${tokenAdmin}`)

        expect(response.status).toBe(401); 
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe("Tipo de token inválido")
    });

    test('PUT /reserva/:0 (ID INVALIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.put(`${urlReserva}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(400); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Parâmetro inválido'); 
    }); 

    test('PUT /reserva/:000000000000000000000000 (ID NAO ENCONTRADO) |DEVE RETORNAR 404|', async() => { 
        const response = await request.put(`${urlReserva}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404); 
        expect(response.headers['content-type']).toMatch(/json/); 
        expect(response.body.msg).toBe('Reserva não encontrada')
    }); 

    test('DELETE /reservas/:id (ADMIN) |DEVE RETORNAR 204|', async() => {
        const response = await request.delete(idUrlReserva2)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

});

    test('DELETE /reservas/:id (SEM TOKEN) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(idUrlReserva);

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Não autorizado');

    });

    test('DELETE /reservas/:id (TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(idUrlReserva)
        .set('Authorization', 'Bearer 123456789');

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Token inválido');

    });

    test('DELETE /reservas/:id (TIPO DE TOKEN INVALIDO) |DEVE RETORNAR 401|', async() => {
        const response = await request.delete(idUrlReserva)
        .set('Authorization', `Basic ${tokenUsuario}`);

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Tipo de token inválido');

    });

    test('DELETE /reservas/:id (USUARIO DONO DA RESERVA) |DEVE RETORNAR 204|', async() => {
        const response = await request.delete(idUrlReserva)
        .set('Authorization', `Bearer ${tokenUsuario}`);

        expect(response.status).toBe(204);
        expect(response.body).toEqual({});

    });

    test('DELETE /reservas/:id (ID INVALIDO) |DEVE RETORNAR 400|', async() => {
        const response = await request.delete(`${urlReserva}/0`)
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(400);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Parâmetro inválido');

    });

    test('DELETE /reservas/:id (ID VALIDO MAS NAO EXISTENTE) |DEVE RETORNAR 404|', async() => {
        const response = await request.delete(
            `${urlReserva}/000000000000000000000000`
        )
        .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Reserva não encontrada');

    });

    test('DELETE /reservas/:id (USUARIO NAO AUTORIZADO) |DEVE RETORNAR 403|', async() => {
        const reservaParaExcluir = await request.post(urlReserva)

        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send(
            {
                quadraId: idQuadra,
                data: '2026-08-29',
                horaInicio: '14:00',
                horaFim: '16:00'
        });

        const idReservaParaExcluir = reservaParaExcluir.body._id;
        const response = await request.delete(`${urlReserva}/${idReservaParaExcluir}`)
        .set('Authorization', `Bearer ${tokenUsuarioNaoAutorizado}`);

        expect(response.status).toBe(403);
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body.msg).toBe('Acesso negado, sem permissão');
        await Reserva.findOneAndDelete({_id: idReservaParaExcluir});
    });
        }); 



afterAll(async() => { 
    const usuariosRemover = [idAdmin, idUsuario,idUsuarioNaoAutorizado]; 
    const reservasRemover = [idReserva,idReserva2]; 
    const quadrasRemover = [idQuadra, idQuadraIndisponivel];
    
    for (const id of usuariosRemover) {
        if(id) {
            await Usuario.findOneAndDelete({_id:id});
        }
    }; 

    for (const id of reservasRemover) {
        if (id) {
            await Reserva.findOneAndDelete({_id:id})
        }
    }; 

    for (const id of quadrasRemover) {
        if(id) {
            await Quadra.findOneAndDelete({_id:id});
        }
    }
})