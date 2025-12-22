import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import studentRoutes from "./routes/studentRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import { connectDB } from "./db/conn.js";
import morgan from "morgan"
import cookieParser from "cookie-parser"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// started the express app
const app = express();

// Configure view engine for emails
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(cookieParser())
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

export default app;