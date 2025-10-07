import express from "express";
import cors from "cors";
import apiRouter from "./src/apiRouter";
import { config } from "dotenv";
import { getEnv } from "./src/utils/env";

config();

const PORT = 3000;
const app = express();

const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN") || "http://localhost:5173";
app.use(
  cors({
    origin: WEBSITE_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}/api/...`);
});
