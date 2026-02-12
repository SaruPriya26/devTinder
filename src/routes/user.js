const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequestModel");
const User = require("../models/userModel");

const userRouter = express.Router();

userRouter.get("/user/requests", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		const connectionRequest = await ConnectionRequest.find({
			toUserId: loggedInUser._id,
			status: "interested",
		}).populate("fromUserId");
		// .populate("fromUserId", "firstName lastName");
		// }).populate("fromUserId", ["firstName", "lastName"]); //Two ways to write populate

		res.json({
			message: "Data fetched successfully",
			data: connectionRequest,
		});
	} catch (err) {
		res.status(400).send("Error: " + err.message);
	}
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		const connectionRequest = await ConnectionRequest.find({
			$or: [
				{ toUserId: loggedInUser._id, status: "accepted" },
				{ fromUserId: loggedInUser._id, status: "accepted" },
			],
		})
			.populate("fromUserId")
			.populate("toUserId");
		// .populate("fromUserId", ["firstName", "lastName"])
		// .populate("toUserId", ["firstName", "lastName"]);

		const data = connectionRequest.map((row) => {
			if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
				return row.toUserId;
			}
			return row.fromUserId;
		});

		res.json({
			data,
		});
	} catch (err) {
		res.status(400).send("Error :" + err.message);
	}
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		const page = req.query.page || 1;
		let limit = req.query.limit || 10;
		limit = limit > 50 ? 50 : limit;

		const skip = (page - 1) * limit;

		const connectionRequest = await ConnectionRequest.find({
			$or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
		}).select("fromUserId toUserId");
		// .populate("fromUserId", "firstName")
		// .populate("toUserId", "firstName");

		const hideUsersFromFeed = new Set();

		connectionRequest.forEach((req) => {
			hideUsersFromFeed.add(req.fromUserId.toString());
			hideUsersFromFeed.add(req.toUserId.toString());
		});

		const users = await User.find({
			$and: [
				{ _id: { $nin: Array.from(hideUsersFromFeed) } },
				{ _id: { $ne: loggedInUser._id } },
			],
		})
			.select("firstName lastName gender skills")
			.skip(skip)
			.limit(limit);

		res.send(users);
	} catch (err) {
		res.status(400).send("Error:" + err.message);
	}
});

module.exports = userRouter;
