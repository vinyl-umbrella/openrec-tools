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
    dt.setHours(dt.getHours() + 9);
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

exports.rankAll = async function (req, res) {
    let limit = 50;
    if (req.query.limit) {
        limit = Number(req.query.limit);
    }
    let ip = req.header('x-forwarded-for');
    console.log(ip, "[rank-user] all");

    let conn = await connectDB(functions.config().oci.rankdb);
    let sql = "SELECT userid, count FROM all_rank ORDER BY count DESC LIMIT ?";
    try {
        [results] = await conn.query(sql, [limit]);
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
}

exports.rankUser = async function (req, res) {
    const userid = req.params.userid;
    let ip = req.header('x-forwarded-for');
    console.log(ip, "[rank-user]", userid);
    const pool = cPool(functions.config().oci.rankdb);

    let tasks = [];
    let data = {};
    let l = ymlist();

    for (let ym of l) {
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
    pool.end();

    for (let i = 0; i < results.length; i++) {
        if (results[i][0].length != 0) {
            data[l[i]] = results[i][0][0]["count"];
        } else {
            data[l[i]] = 0;
        }
    }
    res.send(data);
}


exports.rankYM = async function (req, res) {
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
}
