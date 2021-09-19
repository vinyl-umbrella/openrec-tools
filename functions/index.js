const functions = require("firebase-functions");

const express = require('express');
const mysql = require('mysql2/promise')
const cors = require('cors');

async function connectDB(dbname) {
    let conn = await mysql.createConnection({
        host: functions.config().oci.ip,
        user: functions.config().oci.user,
        password: functions.config().oci.pass,
        database: dbname,
        charset: 'utf8mb4'
    })
    return conn;
}

function cPool(dbname) {
    let pool = mysql.createPool({
        host: functions.config().oci.ip,
        user: functions.config().oci.user,
        password: functions.config().oci.pass,
        database: dbname,
        charset: 'utf8mb4'
    })
    return pool;
}

function ymlist() {
    let dt = new Date();
    let y = dt.getFullYear();
    let l = [];
    for (let i = 1; i < 13; i++) {
        let m = (dt.getMonth() - i + 12) % 12 + 1;
        if (m < 10) {
            m = "0" + m;
        }
        if (m == 12) {
            y--;
        }
        l.push(String(y) + String(m));
    }
    return l;
}


const app = express();
app.use(cors({ origin: true }));

app.get('/v2/rank/user/:userid', async (req, res) => {
    const userid = req.params.userid;
    let ip = req.header('x-forwarded-for');
    console.log(ip, "[rank-user]", userid);
    const pool = cPool(functions.config().oci.rankdb);

    let tasks = [];
    let data = {};

    for (let ym of ymlist()) {
        let tablename = "rank" + ym;
        let sql = "SELECT count FROM ?? WHERE userid = BINARY ?";

        try {
            tasks.push(pool.query(sql, [tablename, userid]));
        } catch (e) {
            console.log(e);
            res.status(500).send();
        }
    }
    results = await Promise.all(tasks);

    for (let i = 0; i < results.length; i++) {
        if (results[i][0].length != 0) {
            data[ymlist()[i]] = results[i][0][0]["count"];
        } else {
            data[ymlist()[i]] = 0;
        }
    }
    res.send(data);
})

app.get('/v2/rank/:year/:month', async (req, res) => {
    const year = req.params.year;
    const month = req.params.month;
    let limit = 50;
    if (req.query.limit) {
        limit = Number(req.query.limit);
    }
    let tablename = "rank" + year + month;
    let ip = req.header('x-forwarded-for');
    console.log(ip, "[rank-ym]", year, month, limit);

    let conn = await connectDB(functions.config().oci.rankdb);
    let sql = "SELECT userid, count FROM ?? ORDER BY count DESC LIMIT ?";
    try {
        [results] = await conn.query(sql, [tablename, limit]);
        res.send(results);
    } catch (e) {
        if (e.code == 'ER_NO_SUCH_TABLE') {
            res.status(404).send({});
        } else {
            console.log(e);
            res.status(500).send(e);
        }
    } finally {
        conn.end();
    }
})

app.post('/v1/messages', async (req, res) => {
    // intial value
    let ip = req.header('x-forwarded-for');
    let userid = "";
    let search_string = "%";
    let startdate = "2015-01-01 00:00:00";
    let enddate = "2030-12-31 23:59:59";
    let border = 0;
    let conn = await connectDB(functions.config().oci.logdb);
    // 与えられている かつ 空でないなら
    // 初期値を与えられたものに変更
    if (req.body.userid && req.body.userid != "") userid = req.body.userid;
    if (req.body.border && req.body.border != "") border = req.body.border;
    if (req.body.search_string && req.body.search_string != "") search_string = "%" + req.body.search_string + "%";
    if (req.body.startdate && req.body.startdate != "") startdate = req.body.startdate;
    if (req.body.enddate && req.body.enddate != "") enddate = req.body.enddate;


    if (!req.body.videoid) {
        res.status(403).send({
            "status": -1,
            "message": "need video id"
        })
    }

    let sql = '';
    let arr = [];
    let temp1 = 'SELECT id, time, userid, message FROM ?? WHERE id > ? AND ';
    let temp2 = 'time BETWEEN ? AND ? AND message like ? COLLATE utf8mb4_bin ORDER BY id LIMIT 50';
    if (req.body.userid) {
        sql = temp1 + 'userid = BINARY ? AND ' + temp2;
        arr = [req.body.videoid, border, userid, startdate, enddate, search_string];
    } else {
        sql = temp1 + temp2;
        arr = [req.body.videoid, border, startdate, enddate, search_string]
    }

    console.log(ip, "[message]", req.body.videoid, userid, search_string, border);

    try {
        const [results] = await conn.query(sql, arr);
        res.send(results);
    } catch (e) {
        await conn.rollback();
        console.log(e);
        res.status(500).send([]);
    } finally {
        conn.end();
    }
})

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
