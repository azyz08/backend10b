const mongoose = require("mongoose");

const OquvchiSchema = new mongoose.Schema({
    oquvchi: {
        type: String,
        require: true,
    }
});

const Oquvchi = mongoose.model("Oquvchi", OquvchiSchema);

module.exports = Oquvchi;