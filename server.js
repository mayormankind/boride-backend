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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// started the express app
const app = express();
const PORT = process.env.DEV_PORT || 5000;

// Configure view engine for emails
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.json());
app.use(morgan("dev"))
app.use(cors());
app.use(helmet());

connectDB();

// api routes
app.use("/api/student", studentRoutes);
app.use("/api/driver", driverRoutes);

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