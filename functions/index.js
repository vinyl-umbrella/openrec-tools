const functions = require("firebase-functions");

// load express
const express = require('express');
const cors = require('cors');

// cloud functionでfirestoreを使うのに必要な設定は以下の２行
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase)
// データベースの参照を作成
var fireStore = admin.firestore()

const app = express();
app.use(cors({ origin: true }));

app.get('/v1/user/:userid', (req, res) => {
    const userid  = req.params.userid;
    let year = 2020;
    let month = 6;  // !!注目
    let ym = [];
    let status = -1;
    let data = {};

    // 過去12ヶ月分
    for (let i=1; i<13; i++) {
        if (month == 13) {
            month = 1;
            year += 1;
        }
        ym.push([year, month]);
        month += 1;
    }

    let promiseArray = ym.map(yearMonth => fireStore.collection(String(yearMonth[0])).doc(String(yearMonth[1])).get());
    Promise.all(promiseArray).then(snap => {
        for (let i=0; i<snap.length; i++) {
            if (snap[i].exists) {
                if(snap[i].data()[userid]) {
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
        .set("Cache-Control", "public, max-age=604800")
        .send({
            "status": status,
            "data": data
        })
    })
})

app.get('/v1/ym/:year/:month', function(req, res) {
    let doc = fireStore.collection(req.params.year).doc(req.params.month);
    doc.get().then(doc => {
        if (!doc.exists) {
            res.send({"status": -1});
        } else {
            res
            .set("Cache-Control", "public, max-age=604800")
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

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = {api};
