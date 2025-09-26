import express from "express";
import cors from "cors";
import apiRouter from "./src/apiRouter";

const PORT = 3000;
const app = express();

app.use(cors());
// middleware to parse json requests (Content-Type: application/json)
app.use(express.json());

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}/api/...`);
});
