'use strict'

const app = require('../index');
const request = require('supertest')


describe('msg test', () => {
    it('msg', async () => {
        const data = {
            userid: 'indegnasen',
            videoid: 'ov82d410wzw',
            search_string: 'クソガキ',
            startdate: '',
            enddate: '',
            border: 0
        }
        let res = await request(app.api).post('/v1/messages').send(data);
        expect(res.statusCode).toBe(200);
        for (let b of res.body) {
            expect(b.id).toBeDefined();
            expect(b.time).toBeDefined();
            expect(b.userid).toBeDefined();
            expect(b.message).toBeDefined();
            expect(b.notexists).not.toBeDefined();
        }
    })

    it('msg not exist', async () => {
        const data = {
            userid: '',
            videoid: 'not_exsits_table',
            search_string: '',
            startdate: '',
            enddate: '',
            border: 0
        }
        let res = await request(app.api).post('/v1/messages').send(data);
        expect(res.statusCode).toBe(500);
    })
})


