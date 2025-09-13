import express from "express";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import bcrypt from "bcryptjs";
const router = express.Router();

// Get tenant info by slug
router.get("/:slug", auth, async (req, res) => {
  const tenant = await Tenant.findOne({ slug: req.params.slug });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json(tenant);
});

// Upgrade endpoint (Admin only)
router.post("/:slug/upgrade", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const tenant = await Tenant.findOneAndUpdate(
    { slug: req.params.slug },
    { plan: "pro" },
    { new: true }
  );
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json({ success: true, tenant });
});

// Invite user (Admin only)
router.post("/:slug/invite", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const { email, role } = req.body;
  const tenant = await Tenant.findOne({ slug: req.params.slug });
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "User already exists" });
  const password = "password";
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: passwordHash,
    role,
    tenantId: tenant._id,
  });
  res.json({ success: true, user });
});

export default router;
