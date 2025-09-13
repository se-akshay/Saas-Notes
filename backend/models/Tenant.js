import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
});

export default mongoose.model("Tenant", tenantSchema);
