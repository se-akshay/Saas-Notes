import express from "express";
import Note from "../models/Note.js";
import Tenant from "../models/Tenant.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create a note
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  const { tenantId, userId } = req.user;
  const tenant = await Tenant.findById(tenantId);
  if (tenant.plan === "free") {
    const noteCount = await Note.countDocuments({ tenantId });
    if (noteCount >= 3)
      return res
        .status(403)
        .json({ error: "Note limit reached. Upgrade to Pro." });
  }
  const note = await Note.create({ title, content, tenantId, userId });
  res.json(note);
});

// List all notes
router.get("/", auth, async (req, res) => {
  const { tenantId } = req.user;
  const notes = await Note.find({ tenantId }).populate({
    path: "userId",
    select: "email name",
  });
  // Map userId to createdBy for frontend compatibility
  const notesWithCreator = notes.map((note) => ({
    ...note.toObject(),
    createdBy: note.userId
      ? {
          email: note.userId.email,
          name: note.userId.name || undefined,
        }
      : undefined,
  }));
  res.json(notesWithCreator);
});

// Get specific note
router.get("/:id", auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOne({ _id: req.params.id, tenantId });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// Update note
router.put("/:id", auth, async (req, res) => {
  const { tenantId, userId } = req.user;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, tenantId, userId },
    req.body,
    { new: true }
  );
  if (!note)
    return res.status(404).json({ error: "Note not found or not allowed" });
  res.json(note);
});

// Delete note
router.delete("/:id", auth, async (req, res) => {
  const { tenantId, userId } = req.user;
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    tenantId,
    userId,
  });
  if (!note)
    return res.status(404).json({ error: "Note not found or not allowed" });
  res.json({ success: true });
});

export default router;
