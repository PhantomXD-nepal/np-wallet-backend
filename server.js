import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import transactionsRoutes from "./routes/transactions.js";
import summaryRoutes from "./routes/summary.js";
import cors from "cors";

import job from "./config/cron.js";
dotenv.config();

const app = express();

app.use(rateLimiter);
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  job.start();
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            is_expense BOOLEAN NOT NULL DEFAULT TRUE,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

    console.log("Database initialized successfully");
  } catch (e) {
    console.log(e);
  }
}

app.use("/api/transactions", transactionsRoutes);
app.use("/api/transactions/summary", summaryRoutes);

initDB().then(() => {
  console.log("Server is running monkey");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
