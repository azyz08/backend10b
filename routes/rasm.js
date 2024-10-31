const express = require("express");
const route = express.Router();
const Rasmlar = require("../models/rasm");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET - Barcha rasmlarni sahifalab olish
route.get("/rasmlar", async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const take = 10; // Har bir sahifada 10 ta rasm ko'rsatamiz

        const rasmlar = await Rasmlar.find()
            .sort({ createdAt: -1 }) // Yangi qo'shilgan rasmlarni birinchi qilib ko'rsatish
            .skip((page - 1) * take)
            .limit(take);

        const BarchaRasmlar = await Rasmlar.countDocuments();

        res.send({ page, all: BarchaRasmlar, allPage: Math.ceil(BarchaRasmlar / take), rasmlar });
    } catch (error) {
        console.error("Serverda xato:", error);
        res.status(500).json({ message: "Server xato", error: error.message });
    }
});


// GET - Rasm ID bo'yicha olish
route.get("/rasmlar/:id", async (req, res) => {
    try {
        const { id } = req.params; // URL dan ID ni olish
        const rasm = await Rasmlar.findById(id); // ID bo'yicha rasmni qidirish

        if (!rasm) {
            return res.status(404).json({ message: "Rasm topilmadi" }); // Agar rasm topilmasa
        }

        res.status(200).json(rasm); // Rasmni qaytarish
    } catch (error) {
        res.status(500).json({ message: error.message }); // Xatolik haqida xabar
    }
});

// DELETE - Rasm ID bo'yicha o'chirish
route.delete("/rasmlar/:id", async (req, res) => {
    try {
        const { id } = req.params; // URL dan ID ni olish
        const rasm = await Rasmlar.findById(id); // ID bo'yicha rasmni qidirish

        if (!rasm) {
            return res.status(404).json({ message: "Rasm topilmadi" }); // Agar rasm topilmasa
        }

        // Rasm faylini o'chirish
        fs.unlink(rasm.image, async (err) => {
            if (err) {
                console.error("Faylni o'chirishda xato:", err);
                return res.status(500).json({ message: "Faylni o'chirishda xato" });
            }
            console.log("Fayl muvaffaqiyatli o'chirildi");

            // Rasmni o'chirishdan keyin javobni yuboring
            await Rasmlar.findByIdAndDelete(id); // ID bo'yicha rasmni o'chirish
            res.status(200).json({ message: "Rasm muvaffaqiyatli o'chirildi" }); // Muvaffaqiyatli o'chirilganini qaytarish
        });
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

// POST - Rasm yuklash
route.post("/rasmlar", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Rasm yuklanmadi" });
    }

    const newRasm = new Rasmlar({
        image: req.file.path // Faylning yo'lini saqlaymiz
    });

    try {
        const savedRasm = await newRasm.save();
        res.status(201).json({
            message: "Rasm muvaffaqiyatli yuklandi",
            imageUrl: `${savedRasm.image.replace(/\\/g, '/').split('/').pop()}`, // Rasm nomini qaytarish
            createdAt: savedRasm.createdAt // Yaratilgan vaqtni ham qaytarish
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = route;
