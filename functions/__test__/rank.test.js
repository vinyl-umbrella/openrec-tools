'use strict'

const app = require('../index');
const request = require('supertest')


describe('rank test', () => {
    it('rank all', async () => {
        let res = await request(app.api).get('/v2/rank/all');
        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.body).length).toBe(50);
    })

    it('rank user', async () => {
        let res = await request(app.api).get('/v2/rank/user/indegnasen');
        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.body).length).toBeGreaterThan(20);
    })

    it('rank ym', async () => {
        let res = await request(app.api).get('/v2/rank/2021/08');
        expect(res.statusCode).toBe(200);
    })

    it('rank ym with limit', async () => {
        let res = await request(app.api).get('/v2/rank/2021/09').query({ limit: 200 });
        expect(res.statusCode).toBe(200);
    })

    it('rank ym  with no table', async () => {
        let res = await request(app.api).get('/v2/rank/2019/08');
        expect(res.statusCode).toBe(404);
    })
})
