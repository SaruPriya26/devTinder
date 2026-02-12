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

			const ALLOWED_STATUS = ["interested", "ignored"];

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

requestRouter.post(
	"/request/review/:status/:requestId",
	userAuth,
	async (req, res) => {
		try {
			const loggedInUser = req.user;
			const { status, requestId } = req.params;

			const ALLOWED_STATUS = ["accepted", "rejected"];
			const isStatusValid = ALLOWED_STATUS.includes(status);
			if (!isStatusValid) {
				res.status(404).send("Status is not valid");
			}
			//one way
			// const isRequestIdExists = ConnectionRequest.findOne(requestId);
			// if (!isRequestIdExists) {
			// 	res.status(404).send("Connection request not found");
			// }

			const connectionRequest = await ConnectionRequest.findOne({
				_id: requestId,
				toUserId: loggedInUser._id,
				status: "interested",
			});
			console.log("check", connectionRequest);
			if (!connectionRequest) {
				res.status(404).send("Connection request not found");
			}
			console.log(status);
			connectionRequest.status = status;
			console.log(connectionRequest.status);
			const data = await connectionRequest.save();
			console.log("ddd", data);
			res.json({ message: "Connection request" + status, data });
		} catch (err) {
			res.status(400).send("Error : " + err.message);
		}
	},
);

module.exports = requestRouter;
