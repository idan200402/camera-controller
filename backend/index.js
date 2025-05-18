// 📁 backend/index.js
const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const { streamHandler } = require("./stream");
const cameraRoutes = require("./routes/cameras");
const authRoutes = require("./routes/auth"); // ✅ חדש
const connectDB = require("./mongo"); // ✅ חדש
require("dotenv").config(); // שימוש ב-MONGO_URI

const app = express();
expressWs(app); // 🎥 Enable WebSocket support

app.use(cors()); // ✅ Enable CORS for all routes
app.use(express.json()); // ✅ Parse JSON request bodies

// 📌 Mount /api routes (including /api/cameras)
app.use("/api", cameraRoutes);

// 🎥 WebSocket route for camera stream
app.ws("/stream", streamHandler);


// 📡 חיבור למסד נתונים
connectDB();

// 📌 Routes
app.use("/api", cameraRoutes);
app.use("/api", authRoutes); // ✅ חדש

const PORT = process.env.PORT || 3000;
const https = require("https");

app.get("/proxy-stream", (req, res) => {
  const url = "https://video.weather2day.co.il:4438/live/hermon/playlist.m3u8";

  https.get(url, (streamRes) => {
    // Forward headers from the remote server
    res.setHeader("Content-Type", streamRes.headers["content-type"] || "application/vnd.apple.mpegurl");

    streamRes.pipe(res);
  }).on("error", (err) => {
    console.error("Stream proxy error:", err.message);
    res.status(500).send("Failed to fetch stream");
  });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
