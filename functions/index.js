const functions = require("firebase-functions");

const express = require('express');
const mysql = require('mysql')
const cors = require('cors');

// firestore
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase)
var fireStore = admin.firestore()

// msyql at oci
const conn = mysql.createConnection({
    host: functions.config().oci.ip,
    user: functions.config().oci.user,
    password: functions.config().oci.pass,
    database: functions.config().oci.db
})

const app = express();
app.use(cors({ origin: true }));

app.get('/v1/user/:userid', (req, res) => {
    var ip = req.header('x-forwarded-for');
    const userid = req.params.userid;
    let year = 2020;
    let month = 9;  // !!注目
    let ym = [];
    let status = -1;
    let data = {};

    console.log(ip, "[rank-user]", userid);

    // 過去12ヶ月分
    for (let i = 1; i < 13; i++) {
        if (month == 13) {
            month = 1;
            year += 1;
        }
        ym.push([year, month]);
        month += 1;
    }

    let promiseArray = ym.map(yearMonth => fireStore.collection(String(yearMonth[0])).doc(String(yearMonth[1])).get());
    Promise.all(promiseArray).then(snap => {
        for (let i = 0; i < snap.length; i++) {
            if (snap[i].exists) {
                if (snap[i].data()[userid]) {
                    data[ym[i][0] + "-" + ym[i][1]] = snap[i].data()[userid];
                } else {
                    data[ym[i][0] + "-" + ym[i][1]] = 0;
                }
                status = 1;
            }
        }
        return data;
    }).then(data => {
        res.set("Cache-Control", "public, max-age=3600").send({
            "status": status,
            "data": data
        })
    })
})

app.get('/v1/ym/:year/:month', function (req, res) {
    var ip = req.header('x-forwarded-for');
    let doc = fireStore.collection(req.params.year).doc(req.params.month);
    console.log(ip, "[rank-ym]", req.params.year, req.params.month);

    doc.get().then(doc => {
        if (!doc.exists) {
            res.send({ "status": -1 });
        } else {
            res.set("Cache-Control", "public, max-age=3600").send({
                "status": 1,
                "data": doc.data()
            });
        }
    }).catch(err => {
        res.send(err);
    })
})

app.post('/v1/messages', (req, res) => {
    // intial value
    var ip = req.header('x-forwarded-for');
    let userid = "";
    let search_string = "%";
    let startdate = "2015-01-01 00:00:00";
    let enddate = "2030-12-31 23:59:59";
    let border = 0;
    // 与えられている かつ 空でないなら
    // 初期値を与えられたものに変更
    if (req.body.userid && req.body.userid != "") userid = req.body.userid;
    if (req.body.border && req.body.border != "") border = req.body.border;
    if (req.body.search_string && req.body.search_string != "") search_string = "%" + req.body.search_string + "%";
    if (req.body.startdate && req.body.startdate != "") startdate = req.body.startdate;
    if (req.body.enddate && req.body.enddate != "") enddate = req.body.enddate;


    if (!req.body.videoid) {
        res.status(500).send({
            "status": -1,
            "message": "need video id"
        })
    }

    let sql = '';
    let arr = [];
    let temp1 = 'SELECT id, time, userid, message FROM ?? WHERE id > ? AND ';
    let temp2 = 'time BETWEEN ? AND ? AND message like BINARY ? ORDER BY id LIMIT 50';
    if (req.body.userid) {
        sql = temp1 + 'userid = BINARY ? AND ' + temp2;
        arr = [req.body.videoid, border, userid, startdate, enddate, search_string];
    } else {
        sql = temp1 + temp2;
        arr = [req.body.videoid, border, startdate, enddate, search_string]
    }

    console.log(ip, "[message]", req.body.videoid, userid, search_string, border);

    conn.query(sql, arr, (err, results) => {
            if (err) {
                console.error(err);
                res.status(404).send([]);
            }
            res.send(results);
        }
    )
})

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
