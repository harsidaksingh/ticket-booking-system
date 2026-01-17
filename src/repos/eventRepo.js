const oracledb = require('oracledb');
const getEventQuery = `select * from events`;
const findAll = async () => {
    let connection;
    try {
        connection = await oracledb.getConnection('oracleDB');
        const result = await connection.execute(getEventQuery, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAll
}