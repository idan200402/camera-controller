import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function LiveCam() {
  const videoRef = useRef(null);
  const [typedText, setTypedText] = useState("");
  const typingQueue = useRef([]);
  const isTyping = useRef(false);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  const addMessageToQueue = (message) => {
    typingQueue.current.push(...message.split(""));
    triggerTyping();
  };

  const triggerTyping = () => {
    if (isTyping.current) return;

    isTyping.current = true;
    const typeNextChar = () => {
      if (typingQueue.current.length > 0) {
        const nextChar = typingQueue.current.shift();
        setTypedText((prev) => prev + nextChar);
        setTimeout(typeNextChar, 70); // Typing speed
      } else {
        isTyping.current = false;
      }
    };
    typeNextChar();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource("https://camera-controller-gfyf.onrender.com/proxy-stream");

      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = "https://video.weather2day.co.il:4438/live/hermon/playlist.m3u8";
    }

    const firstLine = `[${getTimestamp()}] No object was found... Area is clear...\n`;
    addMessageToQueue(firstLine);

    const interval = setInterval(() => {
      const newLine = `[${getTimestamp()}] No object was found... Area is clear...\n`;
      addMessageToQueue(newLine);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-center" style={{ flexDirection: "column", paddingTop: "2rem" }}>
      <h2 className="dashboard-title">Live Stream</h2>

      <div style={{
        position: "relative",
        width: "55%",
        maxWidth: "1400px",
        overflow: "hidden",
        borderRadius: "0.5rem",
        border: "1px solid #30363d",
        boxShadow: "0 0 40px rgba(255, 0, 0, 0.1)"
      }}>
        <video
          id="video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            filter: "grayscale(0.8) contrast(1.3) brightness(0.8)",
            backgroundColor: "#000"
          }}
        />

        {/* 🔴 Recording badge */}
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "6px 12px",
          borderRadius: "8px",
          color: "#f85149",
          fontWeight: "bold",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "red",
            animation: "blink 1s infinite"
          }} />
          Recording
        </div>

        {/* 👾 Glitch overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)"
        }} />
      </div>

      <div
        className="explanation-box"
        style={{
          marginTop: "2rem",
          width: "95%",
          maxWidth: "1400px",
          backgroundColor: "#161b22",
          color: "#c9d1d9",
          border: "1px solid #30363d",
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "1rem",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap",
          minHeight: "4rem"
        }}
      >
        <strong>Explanation:</strong> <br />
        {typedText}
      </div>

      {/* 🔁 Blink keyframes */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
