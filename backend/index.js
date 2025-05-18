// 📁 backend/index.js
const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { streamHandler } = require("./stream");
const cameraRoutes = require("./routes/cameras");
const authRoutes = require("./routes/auth");
const connectDB = require("./mongo");
require("dotenv").config();

const app = express();
expressWs(app); // 🎥 Enable WebSocket support

app.use(cors()); // ✅ Allow frontend access
app.use(express.json()); // ✅ Parse JSON

// 📡 Connect to MongoDB
connectDB();

// 📌 API routes
app.use("/api", cameraRoutes);
app.use("/api", authRoutes);

// 🎥 WebSocket stream route
app.ws("/stream", streamHandler);

// ✅ Full proxy for HLS playlist + segments
app.use(
  "/stream-proxy",
  createProxyMiddleware({
    target: "https://video.weather2day.co.il:4438",
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/stream-proxy": "/live/hermon",
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("Origin", "https://video.weather2day.co.il:4438");
    },
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
