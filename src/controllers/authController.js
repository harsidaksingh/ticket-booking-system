const userService = require("../services/userService")

const register = async (req,res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    await userService.registerUser(name,email,password);
    return res.status(200).json({
        message:"User Registered"
    })
}

const login = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    const token = await userService.loginUser(email,password);
    return res.status(200).json({
        message:"Login Successful",
        token:token
    })
}


module.exports = {
    register,login
}