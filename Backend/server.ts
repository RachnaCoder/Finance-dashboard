import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";


// Routes
import { userRouter } from "./routes/users";
import { recordRouter } from "./routes/records";
import { dashboardRouter } from "./routes/dashboard";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  
  app.use(morgan("dev"));
  app.use(express.json());

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", authMiddleware, userRouter);
  app.use("/api/records", authMiddleware, recordRouter);
  app.use("/api/dashboard", authMiddleware, dashboardRouter);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  
  
  app.listen(PORT,  () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
