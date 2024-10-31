const express = require("express");
const route = express.Router();
const OquvchiDataSchema = require("../models/oquvchiDataCreate");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // fs modulini import qiling

// Multer sozlamalari
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads"); // Fayllarni "uploads" papkasiga saqlaydi
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Fayl nomini vaqt belgisi bilan o'zgartiradi
    }
});

const upload = multer({ storage: storage });

// Barcha O'quvchi ma'lumotlarini olish
route.get("/oquvchi_data", async (req, res) => {
    try {
        const oquvchilar = await OquvchiDataSchema.find().populate("oquvchiId");
        res.status(200).json(oquvchilar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// oquvchiId orqali bog'liq barcha O'quvchi ma'lumotlarini olish
route.get("/oquvchi_data/byOquvchiId/:oquvchiId", async (req, res) => {
    const { oquvchiId } = req.params;

    try {
        // oquvchiId bilan bog'liq barcha O'quvchiData yozuvlarini topish
        const oquvchiData = await OquvchiDataSchema.find({ oquvchiId }).populate("oquvchiId");
        if (!oquvchiData.length) return res.status(404).json({ message: "No OquvchiData found for this oquvchiId" });

        res.status(200).json(oquvchiData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// O'quvchi ma'lumotlarini olish
route.get("/oquvchi_data/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const oquvchi = await OquvchiDataSchema.findById(id).populate("oquvchiId");
        if (!oquvchi) return res.status(404).json({ message: "OquvchiData not found" });
        res.status(200).json(oquvchi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rasm yuklash va O'quvchi ma'lumotlarini yaratish uchun POST so'rovi
route.post("/oquvchi_data", upload.single("rasm"), async (req, res) => {
    const { oquvchiId, ibnBintu, haqida } = req.body;
    const rasm = req.file ? req.file.filename : null;

    const newOquvchi = new OquvchiDataSchema({ oquvchiId, ibnBintu, haqida, rasm });

    try {
        const savedOquvchi = await newOquvchi.save();
        res.status(201).json(savedOquvchi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

route.get("/oquvchi_databycategory", async (req, res) => {
    const { category } = req.query;

    try {
        const oquvchilar = await OquvchiDataSchema.find({ oquvchiId: category }).populate("oquvchiId");
        res.send(oquvchilar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// O'quvchi ma'lumotlarini yangilash
route.put("/oquvchi_data/:id", upload.single("rasm"), async (req, res) => {
    const { id } = req.params;
    const { oquvchiId, ibnBintu, haqida } = req.body;
    let rasm;

    try {
        // Eski o'quvchi ma'lumotlarini olish
        const existingOquvchi = await OquvchiDataSchema.findById(id);
        if (!existingOquvchi) return res.status(404).json({ message: "OquvchiData not found" });

        // Agar yangi rasm yuklangan bo'lsa, eski rasmni o'chirish
        if (req.file) {
            rasm = req.file.filename; // Yangi rasm nomini olamiz
            const oldRasmPath = path.join(__dirname, "../uploads", existingOquvchi.rasm);

            // Eski rasm faylini o'chirish
            fs.access(oldRasmPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldRasmPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Eski rasmni o'chirishda xato:", unlinkErr);
                        } else {
                            console.log("Eski rasm o'chirildi:", existingOquvchi.rasm);
                        }
                    });
                }
            });
        } else {
            // Agar yangi rasm yuklanmagan bo'lsa, eski rasm saqlanadi
            rasm = existingOquvchi.rasm;
        }

        // O'quvchi ma'lumotlarini yangilash
        const updatedOquvchi = await OquvchiDataSchema.findByIdAndUpdate(
            id,
            { oquvchiId, ibnBintu, haqida, rasm },
            { new: true }
        );

        res.status(200).json(updatedOquvchi);
    } catch (error) {
        console.error("O'quvchi yaratishda xato:", error);
        res.status(500).json({ message: error.message });
    }
});

// O'quvchi ma'lumotlarini o'chirish
route.delete("/oquvchi_data/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const oquvchi = await OquvchiDataSchema.findById(id);
        if (!oquvchi) return res.status(404).json({ message: "O'quvchi not found" });

        // O'quvchi ma'lumotlaridan rasm nomini olish
        const rasmPath = path.join(__dirname, "../uploads", oquvchi.rasm);

        // Rasmni o'chirishdan oldin mavjudligini tekshirish
        fs.access(rasmPath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error("Rasm topilmadi:", err);
                // Agar rasm topilmasa, faqat O'quvchi ma'lumotlarini o'chirish
                OquvchiDataSchema.findByIdAndDelete(id)
                    .then(() => res.status(200).json({ message: "O'quvchi deleted successfully, but image not found" }))
                    .catch((error) => res.status(500).json({ message: error.message }));
            } else {
                // Rasmni o'chirish
                fs.unlink(rasmPath, (err) => {
                    if (err) {
                        console.error("Rasmni o'chirishda xato:", err);
                        return res.status(500).json({ message: "Rasmni o'chirishda xato" });
                    }

                    // O'quvchi ma'lumotlarini o'chirish
                    OquvchiDataSchema.findByIdAndDelete(id)
                        .then(() => res.status(200).json({ message: "O'quvchi deleted successfully" }))
                        .catch((error) => res.status(500).json({ message: error.message }));
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = route;
