const validator = require("validator");

const validateSignUpData = (req) => {
	const { firstName, lastName, emailID, password } = req.body;

	if (!firstName || !lastName) {
		throw new Error("Name is not valid");
	} else if (!validator.isEmail(emailID)) {
		throw new Error("EmailID not valid");
	} else if (!validator.isStrongPassword(password)) {
		throw new Error("Enter a Strong Password");
	}
};

module.exports = {
	validateSignUpData,
};
