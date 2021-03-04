const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next(); // required adjusmtent to ensure options request isn't blocked
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; //Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    req.userData = { userId: decodedToken.userId }; //add the token and pass it to other routes
    next(); //forward the request on
  } catch (err) {
    const error = new HttpError("Authentication failed HERE", 401);
    return next(error);
  }
};
