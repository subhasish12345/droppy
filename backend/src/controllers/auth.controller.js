const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// POST /auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get user" });
  }
};

const guestLogin = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required for guest" });

    // Generate random email and password
    const crypto = require("crypto");
    const guestId = crypto.randomUUID();
    const guestEmail = `guest_${guestId}@guest.local`;
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: guestEmail,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Guest created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email, isGuest: true },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create guest" });
  }
};

const claimAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // Ensure the current user is a guest
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!currentUser || !currentUser.email.endsWith("@guest.local")) {
      return res.status(400).json({ error: "Only guest accounts can be claimed" });
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true }
    });

    res.json({
      message: "Account claimed successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to claim account" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return 200 to prevent email enumeration
    if (!user) return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    // Create a short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { id: user.id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: `"Droppy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your Droppy password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f9fa;border-radius:12px">
            <h2 style="color:#4f46e5;margin-bottom:8px">Reset your password</h2>
            <p style="color:#555">Click the button below to reset your Droppy password. This link expires in <strong>15 minutes</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
            <p style="color:#aaa;font-size:12px">If you didn't request this, ignore this email. Your password won't change.</p>
          </div>
        `,
      });
    } else {
      // Dev fallback: print link to console
      console.log("\n🔑 PASSWORD RESET LINK (email not configured):");
      console.log(resetUrl, "\n");
    }

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both current and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Google OAuth users may have empty password
    if (!user.password) return res.status(400).json({ error: "Cannot change password for Google-linked accounts" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

module.exports = { register, login, getMe, guestLogin, claimAccount, forgotPassword, resetPassword, updateProfile, changePassword };

