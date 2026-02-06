const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userModel");
const app = express();
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);


app.get("/user", async (req, res) => {
	const useremail = req.body.emailId;
	try {
		const user = await User.find({ emailID: useremail });
		if (user.length === 0) {
			res.status(404).send("User not found");
		} else {
			res.send(user);
		}
	} catch (err) {
		res.status(400).send("Something went wrong");
	}
});

app.get("/feed", async (req, res) => {
	try {
		const user = await User.find({});
		res.send(user);
	} catch (err) {
		res.status(400).send("Something went wrong");
	}
});

app.delete("/user", async (req, res) => {
	const userId = req.body.id;
	try {
		const user = await User.findByIdAndDelete(userId);
		if (user.length === 0) {
			res.status(404).send("User not found");
		} else {
			res.send("User deleted successfully");
		}
	} catch (err) {
		res.status(400).send("Something went wrong");
	}
});

app.patch("/user", async (req, res) => {
	const userId = req.body.id;
	const data = req.body;

	try {
		const ALLOWED_UPDATES = ["firstName", "password", "gender", "id"];

		const UPDATE_ALLOWED = Object.keys(data).every((k) =>
			ALLOWED_UPDATES.includes(k),
		);

		if (!UPDATE_ALLOWED) {
			throw new Error("Cannot update the user");
		}
		if (data.skills.length > 10) {
			throw new Error("Skills cannot be more than 10");
		}
		await User.findByIdAndUpdate({ _id: userId }, data, {
			runValidators: true,
		});
		res.send("User updated successfully");
	} catch (err) {
		res.status(400).send("Something went wrong" + err.message);
	}
});

connectDB()
	.then(() => {
		console.log("Connected DB");
		app.listen(3001, () => {
			console.log("Server running");
		});
	})
	.catch((err) => {
		console.log("Cannot connect to DB");
	});


