const { getClient } = require("../config/redis");
const userService = require("../services/userService");

const register = async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  await userService.registerUser(name, email, password);
  return res.status(200).json({
    message: "User Registered",
  });
};

const login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const { accessToken, refreshToken } = await userService.loginUser(
    email,
    password,
  );
  res.cookie("jwt_token", accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 900000,
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 604800000,
  });
  return res.status(200).json({
    message: "Login Successful",
  });
};
const logout = async (req, res) => {
  res.clearCookie("jwt_token");
  res.clearCookie("refresh_token");
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    await getClient().del(`refresh_token:${refreshToken}`);
  }
  return res.status(200).json({
    message: "Logout Succesfull",
  });
};
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  const accessToken = await userService.refreshUserToken(refreshToken);
  res.cookie("jwt_token", accessToken, {
    httpOnly: true,
    secure: false,
    maxAge: 900000,
  });
  return res.status(200).json({
    message: "Access Token Refreshed",
  });
};
module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
