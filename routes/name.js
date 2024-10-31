const express = require("express");
const route = express.Router();
const Name = require("../models/name");

// POST - Create a new name
route.post("/names", async (req, res) => {
    const { name, log } = req.body; // log maydonini qo'shamiz
    const timestamp = new Date(); // Hozirgi vaqtni olish

    const newName = new Name({ name, timestamp, log }); // log ni qo'shamiz

    try {
        const savedName = await newName.save();
        res.status(201).json(savedName);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read - GET all names
route.get("/names", async (req, res) => {
    try {
        const names = await Name.find();
        res.status(200).json(names);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read - GET a single name
route.get("/names/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const name = await Name.findById(id);
        if (!name) return res.status(404).json({ message: "Name not found" });
        res.status(200).json(name);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update - PUT
route.put("/names/:id", async (req, res) => {
    const { id } = req.params;
    const { name, log } = req.body; // log maydonini qo'shamiz

    try {
        const updatedName = await Name.findByIdAndUpdate(
            id,
            { name, log }, // log ni qo'shamiz
            { new: true }
        );
        if (!updatedName)
            return res.status(404).json({ message: "Name not found" });
        res.status(200).json(updatedName);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete - DELETE
route.delete("/names/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedName = await Name.findByIdAndDelete(id);
        if (!deletedName)
            return res.status(404).json({ message: "Name not found" });
        res.status(200).json({ message: "Name deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = route;
