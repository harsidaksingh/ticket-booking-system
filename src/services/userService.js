const oracledb = require("oracledb")
const bcrypt = require("bcrypt")
const userRepo = require("../repos/userRepo")
const jwt = require("jsonwebtoken")

const registerUser = async (name,email,password) => {
    let connection;
    try{
        connection = await oracledb.getConnection("oracleDB");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds);
        await userRepo.createUser(connection,name,email,hashedPassword);
        await connection.commit();
        console.log("User Created");
    }catch(error){ 
        if(connection)  await connection.rollback()
        console.error(` User registration failed: ${error.message}`);
        throw error;
    }finally{
        if (connection) {
            await connection.close();
            console.log('🔌 DB Connection Closed');
        }
    }
}

const loginUser = async (email,password) => {
    let connection;
    try{
        connection = await oracledb.getConnection("oracleDB");
        const user = await userRepo.findUserByEmail(connection,email);
        const isMatch = await bcrypt.compare(password,user.PASSWORD);
        if(isMatch){
            const payload = {
                name:user.NAME,
                email:user.EMAIL
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET || "do_not_use_in_prod",{expiresIn:'30min'})
            return token;
        }else{
            throw new Error("Invalid Password")
        }
        
    }catch(error){ 
        if(connection)  await connection.rollback()
        console.error(` User Login failed: ${error.message}`);
        throw error;
    }finally{
        if (connection) {
            await connection.close();
            console.log('🔌 DB Connection Closed');
        }
    }
}

module.exports = {
    registerUser,loginUser
}