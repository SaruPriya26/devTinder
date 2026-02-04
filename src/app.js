const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/userModel");
const app = express();
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

app.post("/signup", async (req, res) => {
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

		await user.save();
		res.send("User added successfully");
	} catch (err) {
		res.status(400).send("Error :" + err.message);
	}
});

app.post("/login", async (req, res) => {
	try {
		const { emailID, password } = req.body;

		const user = await User.findOne({ emailID: emailID });

		if (!user) {
			throw new Error("Invalid Credentials");
		}
		const passwordCompare = await bcrypt.compare(password, user.password);
		if (passwordCompare) {
			res.send("Login Successfuul");
		} else {
			throw new Error("Invalid Credentials");
		}
	} catch (err) {
		res.status(404).send("Error:" + err.message);
	}
});

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


