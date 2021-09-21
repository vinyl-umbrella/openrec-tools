const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const routesMsg = require('./routes/message');
const routesRank = require('./routes/rank');


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/v2/rank/user/:userid', routesRank.rankUser);
app.get('/v2/rank/:year/:month', routesRank.rankYM);
app.post('/v1/messages', routesMsg.msg);

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
