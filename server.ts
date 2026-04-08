import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "unipath-bd-secret-key-123";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin Auth Route
  app.post("/api/admin/login", (req, res) => {
    const { email, role } = req.body;
    
    // In a real app, we'd verify the Firebase ID token here
    // For this demo/prototype, we'll issue a JWT if the role is admin
    if (role === "admin") {
      const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
      res.cookie("admin_token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60 * 1000 
      });
      return res.json({ success: true });
    }
    
    res.status(403).json({ error: "Unauthorized" });
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  app.get("/api/admin/me", (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // AI Counselor Route
  app.post("/api/ai/counsel", async (req, res) => {
    const { prompt, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key not configured on server" });
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  return app;
}

const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  app(req, res);
};
