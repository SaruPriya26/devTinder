const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: {
				values: ["interested", "ignorded", "accepted", "rejected"],
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
	if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
		throw new Error("Connot send connection request to yourself");
	}
	next();
});

const ConnectionRequest = new mongoose.model(
	"ConnectionRequest",
	connectionRequestSchema,
);

module.exports = ConnectionRequest;
