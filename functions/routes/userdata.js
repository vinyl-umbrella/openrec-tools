const functions = require("firebase-functions");
const db = require("./db");

exports.getUserdata = async function (req, res) {
    if (!req.body.id) {
        res.status(404).send();
        return;
    }

    let conn = await db.connectDB(functions.config().ocijp.db);
    let sql = "SELECT id, recxuser_id, nickname, name_color FROM user WHERE id = ?";
    try {
        [results] = await conn.query(sql, [req.body.id]);
        if (results.length === 0) {
            res.status(404).send();
        }
        res.send(results[0]);
    } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).send({});
        } else {
            console.log(e);
            res.status(500).send(e);
        }
    } finally {
        conn.end();
    }
}

exports.getUserdataWithRecxuserId = async function (req, res) {
    if (!req.body.recxuserid) {
        res.status(404).send();
        return;
    }

    let conn = await db.connectDB(functions.config().ocijp.db);
    let sql = "SELECT id, recxuser_id, nickname, name_color FROM user WHERE recxuser_id = ?";
    try {
        [results] = await conn.query(sql, [req.body.recxuserid]);
        if (results.length === 0) {
            res.status(404).send();
        }
        res.send(results[0]);
    } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).send({});
        } else {
            console.log(e);
            res.status(500).send(e);
        }
    } finally {
        conn.end();
    }
}
