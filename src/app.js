const express = require("express");

const app = express();

app.use("/test", (req, res) => {
	res.send("Hello test");
});

app.use((req, res) => {
	res.send("Hello");
});

app.listen(3001, () => {
	console.log("Server running");
});
