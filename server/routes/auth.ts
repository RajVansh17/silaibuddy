import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// In-memory stores (OK for demos; resets on server restart)
const users = new Map<
  string,
  { name: string; phone: string; email?: string; passwordHash: string; verified: boolean }
>();
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Add this list of demo users for your prototype
const demoUsers = [
  { phone: "9876543210", password: "password123" },
  { phone: "1234567890", password: "demo" },
  { phone: "9999999999", password: "test123" },
  { phone: "8888888888", password: "silai123" },
  { phone: "7777777777", password: "admin" },
  { phone: "6666666666", password: "user123" },
];

// Helpers
const jwtSecret = process.env.JWT_SECRET || "dev-secret";
const now = () => Date.now();
const minutes = (n: number) => n * 60 * 1000;

const phoneSchema = z.string().regex(/^\d{10}$/, "Phone must be 10 digits");
const pwdSchema = z.string().min(6, "Password must be at least 6 chars");

// POST /api/auth/register
router.post("/register", (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    phone: phoneSchema,
    email: z.string().email().optional(),
    password: pwdSchema,
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { name, phone, email, password } = parsed.data;
  if (users.has(phone)) return res.status(409).json({ error: "User already exists" });

  const passwordHash = bcrypt.hashSync(password, 10);
  users.set(phone, { name, phone, email, passwordHash, verified: false });
  return res.json({ message: "Registered. Please verify OTP." });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const schema = z.object({ phone: phoneSchema, password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { phone, password } = parsed.data;

  // Check for a hardcoded demo user first
  const isDemoUser = demoUsers.some(
    (user) => user.phone === phone && user.password === password
  );

  // Check for a registered user in the in-memory store
  const registeredUser = users.get(phone);

  if (
    isDemoUser ||
    (registeredUser && bcrypt.compareSync(password, registeredUser.passwordHash))
  ) {
    const token = jwt.sign({ phone }, jwtSecret, { expiresIn: "7d" });
    const user = isDemoUser
      ? { name: "Demo User", phone, email: "demo@example.com", verified: true }
      : {
          name: registeredUser!.name,
          phone: registeredUser!.phone,
          email: registeredUser!.email,
          verified: registeredUser!.verified,
        };

    return res.json({ message: "Login successful", token, user });
  }

  // ❌ Invalid user credentials
  return res.status(401).json({ error: "Invalid phone or password" });
});

// POST /api/auth/send-otp
router.post("/send-otp", (req, res) => {
  const schema = z.object({ phone: phoneSchema });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { phone } = parsed.data;
  if (!users.get(phone) && !demoUsers.some((u) => u.phone === phone)) {
    return res.status(404).json({ error: "User not found. Please sign up." });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  otpStore.set(phone, { code, expiresAt: now() + minutes(5) });

  return res.json({ message: "OTP generated", demoOtp: code, expiresInSec: 300 });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", (req, res) => {
  const schema = z.object({ phone: phoneSchema, code: z.string().length(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { phone, code } = parsed.data;
  const rec = otpStore.get(phone);
  if (!rec) return res.status(400).json({ error: "No OTP requested" });
  if (now() > rec.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (rec.code !== code) return res.status(400).json({ error: "Invalid OTP" });

  const u = users.get(phone);
  if (u) u.verified = true;
  otpStore.delete(phone);

  const token = jwt.sign({ phone }, jwtSecret, { expiresIn: "7d" });
  return res.json({ message: "Phone verified", token });
});

// (Optional) GET /api/auth/me
router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, jwtSecret) as { phone: string };
    const u = users.get(payload.phone);
    if (!u) return res.status(404).json({ error: "User not found" });
    return res.json({
      user: { name: u.name, phone: u.phone, email: u.email, verified: u.verified },
    });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
