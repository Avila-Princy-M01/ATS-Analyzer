import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);

app.get("/", (req, res) => res.send("API Running"));

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
}).catch(err => console.error("DB connection error:", err));