const mongoose = require("mongoose");

const RasmSchema = new mongoose.Schema({
    image: { type: String, required: true }, // Rasm yo'li majburiy
    createdAt: { type: Date, default: Date.now } // Rasm yaratish vaqti
});

const Rasm = mongoose.model("Rasmlar", RasmSchema);

module.exports = Rasm;
