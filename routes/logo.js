const express = require("express");
const route = express.Router();
const Logo = require("../models/logo");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET - Barcha logolarni olish
route.get("/logo", async (req, res) => {
    try {
        // Barcha Logolarni yangi qo'shilgan tartibda olish
        const logo = await Logo.find().sort({ createdAt: -1 });

        const BarchaLogolar = logo.length; // Olingan Logolar soni

        res.send({ all: BarchaLogolar, logo });
    } catch (error) {
        console.error("Serverda xato:", error);
        res.status(500).json({ message: "Server xato", error: error.message });
    }
});

// GET - Logo ID bo'yicha olish
route.get("/logo/:id", async (req, res) => {
    try {
        const { id } = req.params; // URL dan ID ni olish
        const logo = await Logo.findById(id); // ID bo'yicha logoni qidirish

        if (!logo) {
            return res.status(404).json({ message: "Logo topilmadi" }); // Agar logo topilmasa
        }

        res.status(200).json(logo); // Logoni qaytarish
    } catch (error) {
        res.status(500).json({ message: error.message }); // Xatolik haqida xabar
    }
});

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileName = file.originalname.replace(ext, "").replace(/\s/g, "_") + "-" + uniqueSuffix + ext;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

// POST - Faqat bitta logo yuklash
route.post("/logo", upload.single("image"), async (req, res) => {
    const existingLogo = await Logo.findOne(); // Mavjud logoni qidirish
    if (existingLogo) {
        return res.status(400).json({ message: "Faqat bitta logo qo'shishingiz mumkin" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Logo yuklanmadi" });
    }

    const newLogo = new Logo({
        image: req.file.path // Faylning yo'lini saqlaymiz
    });

    try {
        const savedLogo = await newLogo.save();
        res.status(201).json({
            message: "Logo muvaffaqiyatli yuklandi",
            imageUrl: `${savedLogo.image.replace(/\\/g, '/').split('/').pop()}`, // Logo nomini qaytarish
            createdAt: savedLogo.createdAt // Yaratilgan vaqtni ham qaytarish
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Logo yangilash
route.put("/logo/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params; // URL dan ID ni olish

    try {
        const logo = await Logo.findById(id); // ID bo'yicha logoni qidirish

        if (!logo) {
            return res.status(404).json({ message: "Logo topilmadi" }); // Agar logo topilmasa
        }

        // Agar yangi rasm yuklangan bo'lsa, eski faylni o'chirish
        if (req.file) {
            // Faylni o'chirish
            fs.unlink(logo.image, (err) => {
                if (err) {
                    console.error("Faylni o'chirishda xato:", err);
                    return res.status(500).json({ message: "Faylni o'chirishda xato" });
                }
                console.log("Eski fayl muvaffaqiyatli o'chirildi");
            });
            logo.image = req.file.path; // Yangilangan fayl yo'lini saqlaymiz
        }

        const updatedLogo = await logo.save(); // Yangilangan logoni saqlash
        res.status(200).json({
            message: "Logo muvaffaqiyatli yangilandi",
            imageUrl: `${updatedLogo.image.replace(/\\/g, '/').split('/').pop()}`, // Yangilangan logo nomini qaytarish
            createdAt: updatedLogo.createdAt // Yaratilgan vaqtni ham qaytarish
        });
    } catch (error) {
        res.status(500).json({ message: error.message }); // Xatolik haqida xabar
    }
});

module.exports = route;
