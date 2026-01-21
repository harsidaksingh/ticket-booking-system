const oracledb = require('oracledb');

const findUser = async (email) => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');
        const result = await connection.execute(
            `SELECT * FROM users WHERE email = :email`,
            [email],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows[0];
    } catch (err) {
        throw err;
    } finally {
        if (connection) await connection.close();
    }
}

const chargeUser = async (connection, email, amount) => {

    try {
        const result = await connection.execute(
            `UPDATE users SET balance = balance - :amount WHERE email = :email`,
            { amount, email },
            { autoCommit: false }
        );
        return result.rowsAffected;
    } catch (err) {
        throw err;
    } 
}

const findUserForUpdate = async (connection, email) => {
    try {

        const result = await connection.execute(
            `SELECT * FROM users WHERE email = :email FOR UPDATE`,
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows[0];
    } catch (err) {
        throw err;
    }
}

module.exports = { findUser, chargeUser, findUserForUpdate };