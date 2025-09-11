import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { UserModel, User } from "../models/User";

const router = Router();

// OTP store - still in memory for simplicity
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Helpers
const jwtSecret = process.env.JWT_SECRET || "dev-secret";
const now = () => Date.now();
const minutes = (n: number) => n * 60 * 1000;

const phoneSchema = z.string().regex(/^\d{10}$/, "Phone must be 10 digits");
const pwdSchema = z.string().min(6, "Password must be at least 6 chars");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    phone: phoneSchema,
    email: z.string().email().optional(),
    password: pwdSchema,
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { name, phone, email, password } = parsed.data;
  
  try {
    // Check if user already exists
    const existingUser = await UserModel.findByPhone(phone);
    if (existingUser) return res.status(409).json({ error: "User already exists" });

    if (email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) return res.status(409).json({ error: "Email already registered" });
    }

    // Create new user
    await UserModel.createUser({
      name,
      phone,
      email: email || "",
      password,
      verified: false
    });

    return res.json({ message: "Registered. Please verify OTP." });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const schema = z.object({ phone: phoneSchema, password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { phone, password } = parsed.data;

  try {
    // Find user in database
    const user = await UserModel.findByPhone(phone);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    // Validate password
    const isValidPassword = await UserModel.validatePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ phone }, jwtSecret, { expiresIn: "7d" });
    
    // Return success response
    return res.json({ 
      message: "Login successful", 
      token, 
      user: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  const schema = z.object({ phone: phoneSchema });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { phone } = parsed.data;
  
  try {
    // Check if user exists
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      return res.status(404).json({ error: "User not found. Please sign up." });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    otpStore.set(phone, { code, expiresAt: now() + minutes(5) });

    return res.json({ message: "OTP generated", demoOtp: code, expiresInSec: 300 });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  const schema = z.object({ phone: phoneSchema, code: z.string().length(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { phone, code } = parsed.data;
  const rec = otpStore.get(phone);
  if (!rec) return res.status(400).json({ error: "No OTP requested" });
  if (now() > rec.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (rec.code !== code) return res.status(400).json({ error: "Invalid OTP" });

  try {
    // Update user verification status
    await UserModel.updateVerificationStatus(phone, true);
    otpStore.delete(phone);

    const token = jwt.sign({ phone }, jwtSecret, { expiresIn: "7d" });
    return res.json({ message: "Phone verified", token });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// (Optional) GET /api/auth/me
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  
  try {
    const payload = jwt.verify(token, jwtSecret) as { phone: string };
    const user = await UserModel.findByPhone(payload.phone);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    return res.json({
      user: { 
        name: user.name, 
        phone: user.phone, 
        email: user.email, 
        verified: user.verified 
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
