import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session" // for cookie session
import chatRoutes from "./Routers/messageRoutes.js";
import { setupSocketIO } from "./Socket/socketHandler.js";

// Configure environment variables
dotenv.config();

const app = express();

// Database connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.use(cookieParser("secret_passcode"))
app.use(session({
    secret: "secret_passcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,  // Ensure the cookie is httpOnly for security
        secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
        maxAge: 9000000  // Set the cookie's max age to 1000 seconds
    }
}));
const server = http.createServer(app);

// Setup Socket.io
const io = setupSocketIO(server);

// Middleware
app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true, // Allow credentials (cookies) to be sent
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

// Logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/chat", chatRoutes);
// Use other routes...

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).send("Hospital Management System API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
