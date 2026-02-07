const oracledb = require('oracledb');

const findUserByEmail = async (connection, email) => {
    try{

        const sql = `SELECT * FROM users WHERE email = :email`;
        const result = await connection.execute(sql,{email}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows[0];
    }catch(error){
        throw error;
    }
}
const createUser = async (connection, name, email, hashedPassword) => {
    try{
        const sql = `INSERT INTO users (name, email, password, balance) VALUES (:name, :email, :password, 1000)`;
        await connection.execute(sql, { name, email, password: hashedPassword },{autoCommit:false});
    } catch (err) {
        throw err;
    } 
};

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

module.exports = { findUserByEmail,createUser, chargeUser, findUserForUpdate };