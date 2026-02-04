const mongoose = require("mongoose");

const connectDB = async () => {
	await mongoose.connect(
		"mongodb+srv://sarupriyaramesh_db_user:HitrcCTAiUvLvrls@cluster0.pnmaiua.mongodb.net/devTinder",
	);
};

module.exports = connectDB;
