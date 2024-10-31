const express = require("express");
const route = express.Router();
const Password = require("../models/password")

// Read - GET all password
route.get("/password", async (req, res) => {
    try {
        const password = await Password.find();
        res.status(200).json(password);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read - GET a single Password
route.get("/password/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const password = await Password.findById(id);
        if (!password) return res.status(404).json({ message: "password not found" });
        res.status(200).json(password);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update - PUT
route.put("/password/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
        const updatedPassword = await Password.findByIdAndUpdate(
            id,
            { password },
            { new: true }
        );
        if (!updatedPassword)
            return res.status(404).json({ message: "Password not found" });
        res.status(200).json(updatedPassword);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = route;