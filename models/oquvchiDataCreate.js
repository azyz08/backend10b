const mongoose = require("mongoose");

const OquvchiDataSchema = new mongoose.Schema({
    oquvchiId: { type: mongoose.Schema.Types.ObjectId, ref: "Oquvchi", required: true }, // Foreign key
    ibnBintu: { type: String, required: true }, // Majburiy qilingan
    haqida: { type: String, required: true }, // Majburiy qilingan
    rasm: { type: String, required: true }, // Majburiy qilingan
});

const OquvchiData = mongoose.model("DataCreate", OquvchiDataSchema);

module.exports = OquvchiData;
