const jwt = require('jsonwebtoken');
const user = require("../models/registerUsers");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const userDetails = await user.findOne({ _id: verifyUser._id });
        req.token = token;
        req.userDetails = userDetails;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = auth;