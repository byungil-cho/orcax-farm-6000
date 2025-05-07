// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const applicationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  bizNo: String,
  region: String,
  address: String,
  category: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now },
});
const Application = mongoose.model("Application", applicationSchema);

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

app.post("/api/apply", upload.single("bizFile"), async (req, res) => {
  try {
    const { name, phone, bizNo, region, address, category } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    const newApp = new Application({ name, phone, bizNo, region, address, category, filePath });
    await newApp.save();

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: "새 가맹점 신청서 도착",
      text: `📬 [OrcaX 가맹점 신청서 도착]\n\n이름: ${name}\n연락처: ${phone}\n사업자번호: ${bizNo}\n지역: ${region}\n주소: ${address}\n업종/종목: ${category}\n신청서 파일: 첨부 확인`,
      attachments: [{ path: path.join(__dirname, filePath) }],
    });

    res.status(200).json({ message: "신청이 완료되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
