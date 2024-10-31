const mongoose = require("mongoose");

const PassSchema = new mongoose.Schema({
    password: String,
});

const Pass = mongoose.model("Password", PassSchema);

module.exports = Pass;