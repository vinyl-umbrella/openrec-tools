const functions = require("firebase-functions");
const mysql = require('mysql2/promise');


exports.connectDB = async function connectDB(dbname) {
    let conn = await mysql.createConnection({
        host: functions.config().ocijp.ip,
        user: functions.config().ocijp.user,
        password: functions.config().ocijp.pass,
        database: dbname,
        charset: 'utf8mb4'
    })
    return conn;
}

exports.cPool = function cPool(dbname) {
    let pool = mysql.createPool({
        host: functions.config().ocijp.ip,
        user: functions.config().ocijp.user,
        password: functions.config().ocijp.pass,
        database: dbname,
        charset: 'utf8mb4'
    })
    return pool;
}
