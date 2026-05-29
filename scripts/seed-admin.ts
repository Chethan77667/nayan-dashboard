/**
 * Run: npx tsx scripts/seed-admin.ts
 * Creates default admin: admin@nayan.com / admin123
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { resolveMongoUri } from "../lib/mongodb-uri";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nayan";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  const uri = await resolveMongoUri(MONGODB_URI);
  await mongoose.connect(uri);

  const email = "admin@nayan.com";
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.name !== "Nayan R") {
      existing.name = "Nayan R";
      await existing.save();
      console.log("Admin name updated to: Nayan R");
    } else {
      console.log("Admin already exists:", email);
    }
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Nayan R",
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created successfully!");
  console.log("Email: admin@nayan.com");
  console.log("Password: admin123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
