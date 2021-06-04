const functions = require("firebase-functions");

// load express
const express = require('express');
const cors = require('cors');

// cloud functionでfirestoreを使うのに必要な設定は以下の２行
const admin = require('firebase-admin');
// const { firestore } = require("firebase-admin");
// const { defaultDatabase } = require("firebase-functions/lib/providers/firestore");
admin.initializeApp(functions.config().firebase)
// データベースの参照を作成
var fireStore = admin.firestore()

const app = express();
app.use(cors({ origin: true }));

app.get('/v1/user/:userid', async(req, res, next) => {
    const userid  = req.params.userid;
    let year = 2020;
    let month = 6;  // !!注目
    let ym = [];
    let status = -1;
    let data = {};
    for (let i=1; i<13; i++) {
        if (month == 13) {
            month = 1;
            year += 1;
        }
        ym.push([year, month]);
        month += 1;
    }
    try {
        for (let i of ym){
            let doc = fireStore.collection(String(i[0])).doc(String(i[1]));
            let snap = await doc.get();
            let ymStr = String(i[0]) + "-" + String(i[1]);
            status = 1;
            if(snap.data()[userid]) {
                data[ymStr] = snap.data()[userid];
            } else {
                data[ymStr] = 0;
            }
        }
        res.send({
            "status": status,
            "data": data
        })
    } catch (error) {
        next(error);
    }
})

app.get('/v1/ym/:year/:month', function(req, res) {
    let doc = fireStore.collection(req.params.year).doc(req.params.month);
    doc.get().then(doc => {
        if (!doc.exists) {
            res.send({"status": -1});
        } else {
            res.send({
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
