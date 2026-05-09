import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { validateEnv } from "./src/config/env.js";
import { startScheduler } from "./src/services/scheduler.service.js";

const PORT = process.env.PORT || 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    startScheduler(); // Start background notification scheduler
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
