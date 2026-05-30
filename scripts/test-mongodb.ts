/**
 * Test MongoDB connection from .env.local (does not print your password).
 * Run: npm run test:db
 */
import mongoose from "mongoose";
import { resolveMongoUri } from "../lib/mongodb-uri";

function validateUri(raw: string): string | null {
  const uri = raw.trim().replace(/^["']|["']$/g, "");
  if (uri.includes("<password>")) {
    return "MONGODB_URI still contains <password> — replace it with your Atlas password.";
  }
  if (uri.includes(" ") && !uri.includes("%20")) {
    return "MONGODB_URI has spaces — remove spaces or URL-encode them.";
  }
  if (!uri.includes("/nayan")) {
    return "MONGODB_URI should include database name /nayan before the ?";
  }
  return null;
}

async function main() {
  const raw = process.env.MONGODB_URI;
  if (!raw) {
    console.error("FAIL: MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  const hint = validateUri(raw);
  if (hint) {
    console.error("FAIL:", hint);
    process.exit(1);
  }

  const masked = raw.trim().replace(
    /^(mongodb(\+srv)?:\/\/)([^:]+):([^@]+)(@.+)$/,
    "$1$3:****$5"
  );
  console.log("Testing:", masked);

  try {
    const uri = await resolveMongoUri(raw.trim().replace(/^["']|["']$/g, ""));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    await mongoose.connection.db?.admin().ping();
    console.log("OK: Connected to MongoDB successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    const e = err as { codeName?: string; message?: string };
    console.error("FAIL:", e.message ?? err);
    if (e.codeName === "AtlasError" || String(e.message).includes("bad auth")) {
      console.error(`
Wrong Atlas username or password in .env.local.

Do this exactly:
  1. https://cloud.mongodb.com → Database Access
  2. User "mgvrchethan1_db_user" → Edit → Edit Password
  3. Autogenerate → COPY password (do not type by hand)
  4. Update Password
  5. Paste into .env.local ONLY the password part of the URL (after the colon, before @)
  6. Example shape:
     MONGODB_URI=mongodb+srv://mgvrchethan1_db_user:PASTE_HERE@cluster0.b5dhosz.mongodb.net/nayan?retryWrites=true&w=majority
  7. Save file → run: npm run test:db
  8. When OK → restart: npm run dev

If password has special characters, use Autogenerate letters+numbers only.
`);
    }
    process.exit(1);
  }
}

void main();
