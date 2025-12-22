//server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import studentRoutes from "./routes/studentRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import { connectDB } from "./db/conn.js";
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { authMe } from "./controllers/authMe.js"


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://boride-ruby.vercel.app",
];

// started the express app
const app = express();
const PORT = process.env.DEV_PORT || 5000;

// Configure view engine for emails
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"))
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());

connectDB();

// api routes
app.use("/api/student", studentRoutes);
app.use("/api/driver", driverRoutes);
app.get("/api/auth/me", authMe)

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BoRide API v1.0",
    timestamp: new Date().toISOString(),
  });
});

// app listening to requests
app.listen(PORT, () => {
  console.log(`🚀 BoRide Server online @ port -> ${PORT}`);
});