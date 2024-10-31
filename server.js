const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PassRoute = require("./routes/password");
const NameRoute = require("./routes/name");
const OquvchiRoute = require("./routes/oquvchi");
const RasmRoute = require("./routes/rasm");
const OquvchiDataRoute = require("./routes/oquvchiDataCreate");
const LogoRoute = require("./routes/logo");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const corsOptions = {
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Static papkalar
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/oquvchi_images", express.static(path.join(__dirname, "oquvchi_images"))); // Yangi papka

// uploads uchun rasm fayllarini ko'rsatish
app.get("/uploads", (req, res) => {
    fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
        if (err) return res.status(500).json({ message: "Fayllarni o'qishda xato" });
        const images = files.map(file => ({ name: file, url: `/uploads/${file}` }));
        res.json(images);
    });
});

// oquvchi_images uchun rasm fayllarini ko'rsatish
app.get("/oquvchi_images", (req, res) => {
    fs.readdir(path.join(__dirname, "oquvchi_images"), (err, files) => {
        if (err) return res.status(500).json({ message: "Fayllarni o'qishda xato" });
        const images = files.map(file => ({ name: file, url: `/oquvchi_images/${file}` }));
        res.json(images);
    });
});

// Rasm yuklash uchun multer sozlamalari
const oquvchiImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "oquvchi_images"); // Rasmni `oquvchi_images` papkasiga saqlaydi
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Fayl nomini vaqt bilan birlashtiradi
    },
});
const uploadOquvchiImage = multer({ storage: oquvchiImageStorage });

// Rasm yuklash route
app.post("/upload_oquvchi_image", uploadOquvchiImage.single("rasm"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Rasm yuklanmadi" });
    res.status(201).json({ message: "Rasm muvaffaqiyatli yuklandi", url: `/oquvchi_images/${req.file.filename}` });
});

// Boshqa marshrutlar
app.use(PassRoute);
app.use(NameRoute);
app.use(OquvchiRoute);
app.use(RasmRoute);
app.use(OquvchiDataRoute);
app.use(LogoRoute);

mongoose
    .connect("mongodb+srv://ibroximova014:twCHf4TuYI7UCxkh@cluster0.ece4i.mongodb.net/?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Atlasga ulanish muvaffaqiyatli amalga oshirildi"))
    .catch((error) => console.error("MongoDB ulanishida xato:", error));

app.listen(4000, () => {
    console.log(`Server 4000-portda ishga tushdi`);
});
