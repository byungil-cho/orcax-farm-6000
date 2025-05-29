const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const gamjaRoutes = require("./routes/gamja");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api", gamjaRoutes);
app.use(express.static("public"));

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});