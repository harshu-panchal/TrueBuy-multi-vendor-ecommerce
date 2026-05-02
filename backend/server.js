import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { validateEnv } from "./src/config/env.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
