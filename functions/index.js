const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const routesMsg = require('./routes/message');
const routesRank = require('./routes/rank');
const routesUser = require('./routes/userdata');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function (req, res, next){
    res.set('Cache-control', 'public, max-age=300, must-revalidate');
    next();
})

app.get('/v2/rank/all', routesRank.rankAll);
app.get('/v2/rank/user/:userid', routesRank.rankUser);
app.get('/v2/rank/:year/:month', routesRank.rankYM);
app.post('/v1/messages', routesMsg.msg);
app.post('/v1/userdata', routesUser.getUserdata);
app.post('/v1/userdata/recxuserid', routesUser.getUserdataWithRecxuserId);

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
