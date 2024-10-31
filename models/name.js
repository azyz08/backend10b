const mongoose = require("mongoose");

const nameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    log: { // Yangi maydon
        type: String,
        required: false, // Majburiy emas
    },
});

module.exports = mongoose.model("Name", nameSchema);
