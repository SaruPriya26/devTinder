const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userAuth = async (req, res, next) => {
	try {
		const { token } = req.cookies;

		if (!token) {
			throw new Error("Token not valid");
		}

		const decodedData = await jwt.verify(token, "DEV@TINDER$123");

		const { _id } = decodedData;

		const user = await User.findOne({ _id: _id });
		if (!user) {
			throw new Error("User not found");
		}
		req.user = user;
		next();
	} catch (err) {
		res.status(400).send("ERROR : " + err.message);
	}
};

module.exports = {
	userAuth,
};
