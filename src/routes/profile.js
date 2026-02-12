const express = require("express");
const profileRouter = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
	try {
		const user = req.user;
		res.send(user);
	} catch (err) {
		res.status(404).send("ERROR : " + err.message);
	}
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		if (!validateEditProfileData(req)) {
			throw new Error("Cannot update the user");
		}

		Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
		loggedInUser.save();
		res.json({
			message: "User updated successfully",
			data: loggedInUser,
		});
	} catch (err) {
		res.status(404).send("ERROR : " + err.message);
	}
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		const isPasswordValid = await loggedInUser.validatePassword(
			req.body.password,
		);

		if (isPasswordValid) {
			if (!validator.isStrongPassword(req.body.newPassword)) {
				res.send("Enter a strong password");
			} else {
				const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
				loggedInUser["password"] = passwordHash;
				loggedInUser.save();
				res.send("Password updated successfully");
			}
		} else {
			res.status(404).send("Invalid credentials");
		}
	} catch (err) {
		res.status(404).send("Error : " + err.message);
	}
});

module.exports = profileRouter;
