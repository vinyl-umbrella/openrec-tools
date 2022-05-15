const functions = require("firebase-functions");
const db = require('./db');


exports.msg = async function (req, res) {
    if (!req.body.videoid) {
        res.status(400).send({
            "status": -1,
            "message": "videoid is required"
        })
        return;
    }

    // intial value
    let border = 0;
    if (req.body.border) border = req.body.border;

    let conn = await db.connectDB(functions.config().ocijp.db);

    let sql = 'SELECT id, time, userid, message FROM ?? WHERE id > ?';
    let arr = [req.body.videoid, border];
    if (req.body.search_string) {
        sql += ' AND MATCH(message) AGAINST(? IN BOOLEAN MODE)';
        arr.push(req.body.search_string);
    }
    if (req.body.userid) {
        sql += ' AND userid = ?';
        arr.push(req.body.userid);
    }
    if (req.body.startdate) {
        sql += ' AND time >= ?';
        arr.push(req.body.startdate);
    }
    sql += ' ORDER BY id LIMIT 50';

    console.log("[message]", arr);
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
