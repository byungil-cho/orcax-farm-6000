// routes/apply.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const Application = require("../models/Application");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("허용되지 않는 파일 형식입니다."), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", upload.single("bizFile"), async (req, res) => {
  try {
    const { name, phone, bizNo, region, address, category } = req.body;
    const filePath = path.resolve(req.file.path);

    const newApp = new Application({ name, phone, bizNo, region, address, category, filePath });
    await newApp.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "새 가맹점 신청서 도착",
      text: `신청자: ${name}\n연락처: ${phone}\n지역: ${region}\n업종: ${category}`,
      attachments: [{ path: filePath }],
    });

    res.status(200).json({ message: "신청이 완료되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

module.exports = router;
