const functions = require("firebase-functions");
const mysql = require('mysql2/promise');


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

exports.msg = async function (req, res) {
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
}
