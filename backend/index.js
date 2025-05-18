// 📁 backend/index.js
const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const https = require("https"); // ✅ Required for proxying HTTPS streams

const { streamHandler } = require("./stream");
const cameraRoutes = require("./routes/cameras");
const authRoutes = require("./routes/auth");
const connectDB = require("./mongo");
require("dotenv").config();

const app = express();
expressWs(app); // 🎥 Enable WebSocket support

app.use(cors()); // ✅ Allow requests from frontend
app.use(express.json()); // ✅ Parse JSON bodies

// 📡 Connect to DB
connectDB();

// 📌 API routes
app.use("/api", cameraRoutes);
app.use("/api", authRoutes);

// 🎥 WebSocket route for camera stream
app.ws("/stream", streamHandler);

// ✅ NEW: Proxy route for video.m3u8 (to bypass CORS issues)
app.get("/proxy-stream", (req, res) => {
  const url = "https://video.weather2day.co.il:4438/live/hermon/playlist.m3u8";

  https.get(url, (streamRes) => {
    res.setHeader("Content-Type", streamRes.headers["content-type"] || "application/vnd.apple.mpegurl");
    streamRes.pipe(res);
  }).on("error", (err) => {
    console.error("Stream proxy error:", err.message);
    res.status(500).send("Failed to fetch stream");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
