const userService = require("../services/userService")

const register = async (req,res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try{
        await userService.registerUser(name,email,password);
        return res.status(200).json({
            message:"User Registered"
        })
    }catch(error){
        return res.status(500).json({
            message: error?.message || "Internal Server Error"
        })
    }
}

const login = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    try{
        const token = await userService.loginUser(email,password);
        return res.status(200).json({
            message:"Login Successful",
            token:token
        })
    }catch(error){
        return res.status(500).json({
            message: error?.message || "Internal Server Error"
        })
    }
}


module.exports = {
    register,login
}