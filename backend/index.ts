import { config } from "dotenv";
config({
  quiet: true,
});

import express from "express";
import cors from "cors";
import apiRouter from "./src/apiRouter";
import { getEnv } from "./src/config/env";
import mongoose from "mongoose";
import { connectToDb } from "./src/config/db-config";
import cookieParser from "cookie-parser";

// Database
(async () => await connectToDb())();

const PORT = 3000;
const app = express();

// CORS config
const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN") || "http://localhost:5173";
app.use(
  cors({
    origin: WEBSITE_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

// Router middleware
app.use("/api", apiRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}/api/...`);
  });
});
