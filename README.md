# Nayan Dashboard

Modern Next.js dashboard with MongoDB, JWT authentication, and role-based access (Admin / User).

## Features

- User Sign Up & Sign In (auto-opens user dashboard after signup)
- **Daily accounts** — incoming & outgoing amounts per day
- Multiple entries per day with reason + image upload
- Running total balance carries to the next day (IST midnight)
- Calendar to view/edit past days
- Admin (Nayan owner) — view-only user totals & day history
- JWT authentication with protected routes
- MongoDB + Mongoose

## Prerequisites

- Node.js 18+
- MongoDB running locally (or update `MONGODB_URI` in `.env.local`)

## Setup

```bash
cd nayan-dashboard
npm install
```

Create `.env.local` (already included):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nayan
JWT_SECRET=nayan_secret_key
```

Seed the default admin account:

```bash
npx tsx scripts/seed-admin.ts
```

Default admin credentials:

- **Email:** admin@nayan.com
- **Password:** admin123

### Delete user (admin only)

To permanently delete a user account, admin must enter the delete code from `.env.local`:

```env
ADMIN_DELETE_CODE=nayan_delete_2026
```

On the owner dashboard, click **Delete account** → confirm email → enter the code.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` | Create user account |
| `/signin` | Login |
| `/dashboard` | User daily accounts (protected) |
| `/admin/dashboard` | Owner view — all users' daily totals |
| `/admin/users/[id]` | View one user's day history (read-only) |

## Daily calculation

For each day:

- **Opening balance** = previous day's closing balance
- **Day net** = total incoming − total outgoing
- **Closing balance** = opening + day net (carries to next day)

Example: Opening ₹0 → Incoming ₹500, Outgoing ₹300 → Closing ₹200. Next day starts at ₹200.

## Tech Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- JWT + bcryptjs
- Tailwind CSS

---

## Host online — Netlify + MongoDB Atlas

You can host this app on **Netlify** (`netlify.toml` is included).  
**Important:** Netlify cannot use your PC’s local MongoDB (`mongodb://127.0.0.1`). You must set up **MongoDB Atlas** (free cloud database) first, then paste that Atlas URL into Netlify.

| Step | Service | What you do |
|------|---------|-------------|
| **1** | **MongoDB Atlas** | Free cluster, database user, allow `0.0.0.0/0`, copy connection string |
| **2** | **GitHub** | Push this repo (never commit `.env.local`) |
| **3** | **Netlify** | Import repo from GitHub + add env variables (Atlas URI below) |
| **4** | **Your PC** | Run `npm run seed:admin` once with Atlas URI in `.env.local` |

**Full step-by-step guide (screenshots-level detail):** [HOSTING.md](./HOSTING.md)

### Step 1 — MongoDB Atlas (set this before Netlify)

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) → sign up → **M0 FREE** cluster  
2. **Database Access** → add user + password (save the password)  
3. **Network Access** → **Allow Access from Anywhere** (`0.0.0.0/0`) so Netlify can connect  
4. **Database → Connect → Drivers** → copy the string and edit it:
   - Replace `<password>` with your real password  
   - Add database name `/nayan` before `?`:

   ```
   mongodb+srv://USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nayan?retryWrites=true&w=majority
   ```

   Keep this string — you will paste it into Netlify as **`MONGODB_URI`**.

### Step 2 — Push code to GitHub

```bash
cd nayan-dashboard
git init
git add .
git commit -m "Nayan R dashboard"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3 — Netlify (connect Atlas here)

1. [netlify.com](https://www.netlify.com) → sign up with GitHub  
2. **Add new site** → **Import an existing project** → choose your repo  
3. Build settings load from `netlify.toml` (`npm run build`, Next.js plugin)  
4. **Before or right after first deploy** → **Site configuration → Environment variables → Add a variable**

   | Variable | Value |
   |----------|--------|
   | `MONGODB_URI` | **Your MongoDB Atlas string from Step 1** (must include `/nayan`) |
   | `JWT_SECRET` | Long random secret (e.g. `nayan_jwt_prod_...`) — same on PC if you seed locally |
   | `ADMIN_DELETE_CODE` | Your private delete code (e.g. `nayan_delete_2026`) |

5. **Deploy site** → wait until **Published**  
6. Optional: **Domain management → Change site name** → e.g. `https://nayan-r.netlify.app`

Without **`MONGODB_URI`** pointing to Atlas, sign-up and sign-in on the live site will fail.

### Step 4 — Create admin (once, after Netlify is live)

On your PC, set `.env.local` to the **same Atlas URI** and secrets as Netlify, then:

```bash
npm run seed:admin
```

Sign in on your Netlify URL with `admin@nayan.com` / `admin123`, then change the password when you can.

### Netlify notes

| Item | Status |
|------|--------|
| Sign in / Sign up / dashboard | Works with Atlas + env vars set |
| Local MongoDB on Netlify | **Does not work** — use Atlas only |
| Image uploads on Netlify | Temporary on serverless disk; text and amounts still work |

### Alternative: Vercel

Same 3 env variables (`MONGODB_URI` from Atlas, `JWT_SECRET`, `ADMIN_DELETE_CODE`). Import the same GitHub repo at [vercel.com](https://vercel.com).

### Live URL

After deploy: `https://your-site-name.netlify.app`
