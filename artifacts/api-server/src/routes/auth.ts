import { Router, Request, Response } from "express";
import { hashPassword, verifyPassword, generateToken } from "../lib/auth";
import type { AuthRequest } from "../middlewares/auth";
import { authenticate } from "../middlewares/auth";
import fs from "fs/promises";
import path from "path";

const router = Router();
const DB_FILE = path.resolve(process.cwd(), "users_db.json");

// Persistent user storage for testing
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'passenger' | 'agent';
}

async function loadUsers(): Promise<Map<string, User>> {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return new Map(Object.entries(parsed));
  } catch (error) {
    return new Map();
  }
}

async function saveUsers(users: Map<string, User>) {
  const data = JSON.stringify(Object.fromEntries(users));
  await fs.writeFile(DB_FILE, data, "utf-8");
}

// Initialize demo users
async function initDemoUsers() {
  const users = await loadUsers();
  if (users.size === 0) {
    const passengerPassword = await hashPassword("password123");
    const agentPassword = await hashPassword("password123");

    users.set("passenger@demo.com", {
      id: "1",
      email: "passenger@demo.com",
      passwordHash: passengerPassword,
      name: "Aster Mekonnen",
      role: "passenger",
    });

    users.set("agent@demo.com", {
      id: "2",
      email: "agent@demo.com",
      passwordHash: agentPassword,
      name: "Mekdes Abebe",
      role: "agent",
    });
    await saveUsers(users);
  }
}

initDemoUsers();

// Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = "passenger" } = req.body;
    const users = await loadUsers();

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check if user already exists
    if (users.has(email)) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      passwordHash,
      name,
      role,
    };

    users.set(email, newUser);
    await saveUsers(users);

    // Generate token
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const users = await loadUsers();

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    // Find user
    const user = users.get(email);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // If role is specified, verify user has that role
    if (role && user.role !== role) {
      res.status(403).json({ error: `This login is for ${role}s only` });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const users = await loadUsers();
    // Find user by ID
    const user = Array.from(users.values()).find(u => u.id === req.user!.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
