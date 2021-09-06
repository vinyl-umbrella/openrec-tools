const functions = require("firebase-functions");

// load express
const express = require('express');
const mysql = require('mysql')
const cors = require('cors');

// cloud functionでfirestoreを使うのに必要な設定は以下の２行
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase)
// データベースの参照を作成
var fireStore = admin.firestore()

const conn = mysql.createConnection({
    host: functions.config().oci.ip,
    user: functions.config().oci.user,
    password: functions.config().oci.pass,
    database: functions.config().oci.db
})

const app = express();
app.use(cors({ origin: true }));

app.get('/v1/user/:userid', (req, res) => {
    const userid = req.params.userid;
    let year = 2020;
    let month = 9;  // !!注目
    let ym = [];
    let status = -1;
    let data = {};

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
        res
            .set("Cache-Control", "public, max-age=3600")
            .send({
                "status": status,
                "data": data
            })
    })
})

app.get('/v1/ym/:year/:month', function (req, res) {
    let doc = fireStore.collection(req.params.year).doc(req.params.month);
    doc.get().then(doc => {
        if (!doc.exists) {
            res.send({ "status": -1 });
        } else {
            res
                .set("Cache-Control", "public, max-age=3600")
                .send({
                    "status": 1,
                    "data": doc.data()
                });
        }
    })
        .catch(err => {
            res.send(err);
        })
})

app.post('/v1/messages', (req, res) => {
    // intial value
    let userid = "";
    let search_string = "%"
    let startdate = "2015-01-01 00:00:00"
    let enddate = "2030-12-31 23:59:59"
    if (req.body.userid) userid = req.body.userid;
    if (req.body.search_string) search_string = "%" + req.body.search_string + "%";
    if (req.body.startdate) startdate = req.body.startdate;
    if (req.body.enddate) enddate = req.body.enddate;


    if (!req.body.videoid) {
        res.send({
            "status": -1,
            "message": "need video id"
        })
    }

    if (req.body.userid) {
        conn.query(
            'SELECT time, userid, message FROM ?? WHERE userid = ? AND message like ? AND time BETWEEN ? AND ? LIMIT 10',
            [req.body.videoid, req.body.userid, search_string, startdate, enddate],
            (err, results) => {
                if (err) {
                    console.error(err);
                    res.send([]);
                }
                res.send(results);
            }
        )
    } else {
        conn.query(
            'SELECT time, userid, message FROM ?? WHERE message like ? AND time BETWEEN ? AND ? LIMIT 10',
            [req.body.videoid, search_string, startdate, enddate],
            (err, results) => {
                if (err) {
                    console.error(err);
                    res.send([]);
                }
                res.send(results);
            }
        )
    }
})

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
