const functions = require("firebase-functions");
const db = require('./db')


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
    console.log("[rank-all]");

    let conn = await db.connectDB(functions.config().ocijp.db);
    let sql = "SELECT rank_all.userid, rank_all.count, user.nickname FROM rank_all LEFT OUTER JOIN user ON user.id = rank_all.userid  ORDER BY count DESC LIMIT ?";
    try {
        [results] = await conn.query(sql, [limit]);
        res.send(results);
    } catch (e) {
        if (e.code == 'ER_NO_SUCH_TABLE') {
            res.status(404).send({});
        } else {
            console.log(e);
            res.status(500).send();
        }
    } finally {
        conn.end();
    }
}

exports.rankUser = async function (req, res) {
    const userid = req.params.userid;
    console.log("[rank-user]", userid);
    const pool = db.cPool(functions.config().ocijp.db);

    let tasks = [];
    let data = {};
    let l = ymlist();

    for (let ym of l) {
        let tablename = "rank" + ym;
        let sql = "SELECT count FROM ?? WHERE userid = ?";

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
    console.log("[rank-ym]", year, month, limit);

    let conn = await db.connectDB(functions.config().ocijp.db);
    let sql = "SELECT userid, count, user.nickname FROM ?? LEFT OUTER JOIN user ON user.id = ??.userid  ORDER BY count DESC LIMIT ?";
    try {
        [results] = await conn.query(sql, [tablename,  tablename, limit]);
        res.send(results);
    } catch (e) {
        if (e.code == 'ER_NO_SUCH_TABLE') {
            res.status(404).send({});
        } else {
            console.log(e);
            res.status(500).send();
        }
    } finally {
        conn.end();
    }
}
