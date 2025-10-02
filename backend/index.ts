import express from "express";
import cors from "cors";
import apiRouter from "./src/apiRouter";
import { config } from "dotenv";
config();

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}/api/...`);
});
