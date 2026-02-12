const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
		},
		emailID: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Enter a valid email address");
				}
			},
		},
		password: {
			type: String,
			required: true,
			validate(value) {
				if (!validator.isStrongPassword(value)) {
					throw new Error("Enter a strong password");
				}
			},
		},
		age: {
			type: Number,
		},
		gender: {
			type: String,
			validate(value) {
				if (!["male", "female", "others"].includes(value)) {
					throw new Error("Enter a valid gender");
				}
			},
		},
		skills: {
			type: [String],
		},
		photoUrl: {
			type: String,
		},
		about: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

userSchema.methods.getJwt = async function () {
	const user = this;
	const token = await jwt.sign({ _id: user._id }, "DEV@TINDER$123", {
		expiresIn: "1d",
	});
	return token;
};

userSchema.methods.validatePassword = async function (passwordInputFromUser) {
	const user = this;
	const passwordHash = user.password;
	const isPasswordValid = await bcrypt.compare(
		passwordInputFromUser,
		passwordHash,
	);
	return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
