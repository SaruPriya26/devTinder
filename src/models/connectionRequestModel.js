const mongoose = require("mongoose");
const express = require("express");

const connectionRequestSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		status: {
			type: String,
			required: true,
			enum: {
				values: ["interested", "ignored", "accepted", "rejected"],
				message: "{VALUE} is not a correct status type",
			},
		},
	},
	{
		timestamps: true,
	},
);
// Index will make our query run faster
// connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
	const connectionRequest = this;
	console.log("dd", connectionRequest);
	if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
		throw new Error("Cannot send connection request to yourself");
	}
});

const ConnectionRequest = mongoose.model(
	"ConnectionRequest",
	connectionRequestSchema,
);

module.exports = ConnectionRequest;
