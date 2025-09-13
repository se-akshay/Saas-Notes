import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import path from "path";
dotenv.config({ path: path.resolve("../.env") });

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Tenant.deleteMany({});
  await User.deleteMany({});

  const acme = await Tenant.create({
    name: "Acme",
    slug: "acme",
    plan: "free",
  });
  const globex = await Tenant.create({
    name: "Globex",
    slug: "globex",
    plan: "free",
  });

  const passwordHash = await bcrypt.hash("password", 10);

  await User.create({
    email: "admin@acme.test",
    password: passwordHash,
    role: "admin",
    tenantId: acme._id,
  });
  await User.create({
    email: "user@acme.test",
    password: passwordHash,
    role: "member",
    tenantId: acme._id,
  });
  await User.create({
    email: "admin@globex.test",
    password: passwordHash,
    role: "admin",
    tenantId: globex._id,
  });
  await User.create({
    email: "user@globex.test",
    password: passwordHash,
    role: "member",
    tenantId: globex._id,
  });

  console.log("Seeded tenants and users.");
  mongoose.disconnect();
}

seed();
