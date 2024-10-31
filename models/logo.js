const mongoose = require("mongoose");

const LogoSchema = new mongoose.Schema({
    image: { type: String, required: true }, // Logo yo'li majburiy
});

const Logo = mongoose.model("Logo", LogoSchema);

module.exports = Logo;
