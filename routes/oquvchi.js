const express = require("express");
const route = express.Router();
const Oquvchi = require("../models/oquvchi")


// Create
route.post("/oquvchi", async (req, res) => {
    const { oquvchi } = req.body;
    const newOquvchi = new Oquvchi({ oquvchi });

    try {
        const sevedOquvchi = await newOquvchi.save();
        res.status(201).json(sevedOquvchi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read - GET all oquvchi
route.get("/oquvchi", async (req, res) => {
    try {
        const oquvchi = await Oquvchi.find();
        res.status(200).json(oquvchi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read - GET a single oquvchi
route.get("/oquvchi/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const oquvchi = await Oquvchi.findById(id);
        if (!oquvchi) return res.status(404).json({ message: "Oquvchi not found" });
        res.status(200).json(oquvchi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update - PUT
route.put("/oquvchi/:id", async (req, res) => {
    const { id } = req.params;
    const { oquvchi } = req.body;

    try {
        const updatedOquvchi = await Oquvchi.findByIdAndUpdate(
            id,
            { oquvchi },
            { new: true }
        );
        if (!updatedOquvchi)
            return res.status(404).json({ message: "Oquvchi not found" });
        res.status(200).json(updatedOquvchi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete - DELETE
route.delete("/oquvchi/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedOquvchi = await Oquvchi.findByIdAndDelete(id);
        if (!deletedOquvchi)
            return res.status(404).json({ message: "Oquvchi not found" });
        res.status(200).json({ message: "Oquvchi deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = route;