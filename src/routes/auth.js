const express = require("express");
const { validateSignUpData } = require("../utils/validation.js");
const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
	//creating a new instance of user model
	// const user = new User({
	// 	firstName: "Bharathi",
	// 	lastName: "Raja",
	// 	emailID: "bharathi@raja.com",
	// 	password: "bharathi@123",
	// });
	// console.log(req.body);
	// const user = new User(req.body);
	try {
		validateSignUpData(req);

		const { firstName, lastName, emailID, password } = req.body;

		const passwordHash = await bcrypt.hash(password, 10);

		const user = new User({
			firstName,
			lastName,
			emailID,
			password: passwordHash,
		});

		const savedUser = await user.save();
		const token = await savedUser.getJwt();
		res.cookie("token", token, {
			expires: new Date(Date.now() + 8 * 3600000),
		});
		res.json({
			message: "User added successfully",
			data: savedUser,
		});
	} catch (err) {
		res.status(400).send("Error :" + err.message);
	}
});

authRouter.post("/login", async (req, res) => {
	try {
		const { emailID, password } = req.body;

		const user = await User.findOne({ emailID: emailID });

		if (!user) {
			res.status(401).send("Please login");
		}
		const passwordCompare = await user.validatePassword(password);
		if (passwordCompare) {
			const token = await user.getJwt();
			res.cookie("token", token, {
				expires: new Date(Date.now() + 8 * 3600000),
			});
			res.send(user);
		} else {
			throw new Error("Invalid Credentials");
		}
	} catch (err) {
		res.status(404).send("Error:" + err.message);
	}
});

authRouter.post("/logout", async (req, res) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
	});
	res.send("Logout successfully");
});

module.exports = authRouter;
