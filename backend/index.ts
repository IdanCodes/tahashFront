import { config } from "dotenv";
config({
  quiet: true,
});

import express from "express";
import cors from "cors";
import apiRouter from "./src/apiRouter";
import { getEnv, IS_PRODUCTION, tryGetEnv } from "./src/config/env";
import mongoose from "mongoose";
import { connectToDb } from "./src/config/db-config";
import cookieParser from "cookie-parser";
import { HttpHeaders } from "@shared/constants/http-headers";

// Database
(async () => await connectToDb())();

const PORT = 3000;
const app = express();

// CORS config
const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN") || "http://localhost:5173";
app.use(
  cors({
    origin: WEBSITE_ORIGIN,
    allowedHeaders: [
      ...Object.values(HttpHeaders),
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Content-Type",
      "Accept",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.set("trust proxy", 2);

app.use(cookieParser());

if (tryGetEnv("LOG_TO_FILE") === "true") {
  const fs = require("fs");
  const util = require("util");
  const logFile = fs.createWriteStream(__dirname + "/debug_log.log", {
    flags: "a",
  });
  const logStdout = process.stdout;

  console.log = function (d) {
    logFile.write(util.format(d) + "\n");
    logStdout.write(util.format(d) + "\n");
  };
}

if (IS_PRODUCTION) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", WEBSITE_ORIGIN);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      [
        ...Object.values(HttpHeaders),
        "X-Requested-With",
        "X-HTTP-Method-Override",
        "Content-Type",
        "Accept",
      ].join(", "),
    );
    next();
  });
}

// Router middleware
app.use("/api", apiRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}/api/...`);
  });
});
