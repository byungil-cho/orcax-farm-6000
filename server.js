
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/farm", require("./routes/farm"));
app.use("/api/harvest", require("./routes/harvest"));
app.use("/api/product", require("./routes/product"));

app.get("/api/gamja", async (req, res) => {
  const Product = require("./models/Product");
  try {
    const items = await Product.find({});
    const total = items.reduce((acc, item) => acc + (item.name.includes("감자") ? item.count : 0), 0);
    res.json({ potatoes: total, harvested: 0, items });
  } catch (err) {
    res.status(500).json({ error: "데이터 불러오기 실패" });
  }
});

app.get("/api/ping", (req, res) => res.send("pong"));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB 연결 성공");
  app.listen(process.env.PORT, () => console.log("서버 실행 중"));
});
