const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequestModel");
const User = require("../models/userModel");

const { userAuth } = require("../middlewares/auth");

requestRouter.post(
	"/request/send/:status/:toUserId",
	userAuth,
	async (req, res) => {
		try {
			const fromUserId = req.user._id;
			const toUserId = req.params.toUserId;
			const status = req.params.status;

			const ALLOWED_STATUS = ["interested", "ignorded"];

			const isStatusValid = ALLOWED_STATUS.includes(req.params.status);

			if (!isStatusValid) {
				res.status(400).send("Invalid request type");
			}

			const isToUserIdExists = await User.findOne({ _id: toUserId });

			if (!isToUserIdExists) {
				res.status(400).send("Touserid not found");
			}

			const connectionRequestValid = await ConnectionRequest.findOne({
				$or: [
					{ fromUserId, toUserId },
					{ fromUserId: toUserId, toUserId: fromUserId },
				],
			});

			if (connectionRequestValid) {
				res.status(400).send("Connection request already exists");
			}

			const connectionRequest = new ConnectionRequest({
				fromUserId,
				toUserId,
				status,
			});
			const data = await connectionRequest.save();
			res.json({
				message: req.user.firstName + "sent connection request",
				data,
			});
		} catch (err) {
			res.status(404).send("ERROR : " + err.message);
		}
	},
);

module.exports = requestRouter;
