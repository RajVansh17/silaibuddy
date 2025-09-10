import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwtSecret = process.env.JWT_SECRET || "dev-secret";

// In-memory users (replace with DB later)
const users = new Map<string, { email: string; name: string; googleId?: string }>();

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing token" });

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: "Invalid token" });

    const { sub: googleId, email, name } = payload;

    // Check if user exists or create new one
    let user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) {
      user = { email: email || "", name: name || "", googleId };
      users.set(email || "", user);
    }

    // Create your own JWT
    const token = jwt.sign({ email, googleId }, jwtSecret, { expiresIn: "7d" });

    return res.json({ message: "Google login success", token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Auth failed" });
  }
});

export default router;
