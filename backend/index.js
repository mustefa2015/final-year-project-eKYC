import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { initializeModels } from "./models/index.js"; 

// Routes
import faydaRoute from "./Routes/fayda.js";
import organizeDataRoute from "./Routes/organizeData.js"; 
import CallResult from "./Routes/callResult.js";
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",  // Vite dev server
  "http://localhost:5000",  // Optional fallback
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/v1/fayda", faydaRoute);
app.use("/api/v1/organizeData", organizeDataRoute); 
app.use("/api/v1/callresult", CallResult);

const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    
    mongoose.set("strictQuery", false);
    
    // Enhanced connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGO_URL, options);
    console.log("MongoDB database is connected");
    
    await initializeModels();
    console.log("Models initialized successfully");
    
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();