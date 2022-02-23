'use strict'

const app = require('../index');
const request = require('supertest')


describe('user data test', () => {
    it('get user id', async () => {
        const data = {
            "id": "indegnasen",
        }
        let res = await request(app.api).post('/v1/userdata').send(data);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.recxuser_id).toBeDefined();
        expect(res.body.nickname).toBeDefined();
        expect(res.body.name_color).toBeDefined();
        expect(res.body.notexists).not.toBeDefined();
    })

    it('with no param', async () => {
        let res = await request(app.api).post('/v1/userdata').send();
        expect(res.statusCode).toBe(404);
    })

    it('get user data with recxuserid', async () => {
        const data = {
            "recxuserid": 81352753,
        }
        let res = await request(app.api).post('/v1/userdata/recxuserid').send(data);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBeDefined();
        expect(res.body.recxuser_id).toBeDefined();
        expect(res.body.nickname).toBeDefined();
        expect(res.body.name_color).toBeDefined();
        expect(res.body.notexists).not.toBeDefined();
    })

    it('with no param', async () => {
        let res = await request(app.api).post('/v1/userdata/recxuserid').send();
        expect(res.statusCode).toBe(404);
    })
})
