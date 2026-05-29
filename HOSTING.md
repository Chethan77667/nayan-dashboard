# Full Hosting Guide — Nayan R Dashboard

Host your website online so anyone can open it with a link (e.g. `https://nayan-r.netlify.app`).

You need:
1. **GitHub** (store your code online)
2. **MongoDB Atlas** (free cloud database)
3. **Netlify** (free website hosting)

Estimated time: **30–45 minutes**

---

## Part 1 — MongoDB Atlas (database)

Your app cannot use `localhost` MongoDB on the internet. Use Atlas (free).

### 1.1 Create account
1. Open [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or email (free tier is enough)

### 1.2 Create a cluster
1. Click **Build a Database**
2. Choose **M0 FREE** (Shared, free forever)
3. Cloud provider: **AWS** (any region close to you, e.g. Mumbai `ap-south-1`)
4. Cluster name: leave default or type `NayanCluster`
5. Click **Create**

### 1.3 Database user (login for your app)
1. Security → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `nayanadmin` (or any name)
4. Password: click **Autogenerate Secure Password** → **copy and save it** (you need it later)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### 1.4 Allow Netlify to connect
1. Security → **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Confirm (required so Netlify servers can reach your database)

### 1.5 Get connection string
1. Click **Database** → **Connect** on your cluster
2. Choose **Drivers**
3. Driver: **Node.js**, version latest
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://nayanadmin:<password>@nayancluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your real password (no `<` `>`)
6. Add database name before `?`:
   ```
   mongodb+srv://nayanadmin:YOUR_PASSWORD@nayancluster.xxxxx.mongodb.net/nayan?retryWrites=true&w=majority
   ```
7. Save this as **MONGODB_URI** — you will paste it in Netlify.

---

## Part 2 — GitHub (upload your code)

### 2.1 Install Git (if not installed)
1. Download: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Install with default options

### 2.2 Create GitHub repository
1. Open [https://github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name: `nayan-dashboard` (or `nayan-r`)
4. **Private** or Public (your choice)
5. Do **not** add README, .gitignore, or license (project already has files)
6. Click **Create repository**

### 2.3 Push your project from PC

Open **PowerShell** in your project folder:

```powershell
cd "d:\Nayan Anna Prsonal\nayan-dashboard"
```

**Important:** Do not upload secrets. Your `.env.local` is already in `.gitignore`.

```powershell
git init
git add .
git commit -m "Nayan R dashboard ready for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nayan-dashboard.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

If Git asks for login, use GitHub username + **Personal Access Token** (not password):
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

## Part 3 — Netlify (host the website)

**Before this part:** finish **Part 1 (MongoDB Atlas)** and copy your connection string. On Netlify you will set that string as the `MONGODB_URI` environment variable. The live site cannot use `mongodb://127.0.0.1` from your PC.

### 3.1 Create Netlify account
1. Open [https://www.netlify.com](https://www.netlify.com)
2. Sign up → **Sign up with GitHub** (easiest)

### 3.2 Import project
1. Click **Add new site** → **Import an existing project**
2. **Deploy with GitHub** → authorize Netlify
3. Select repository: `nayan-dashboard`
4. Netlify reads `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** leave **blank** (the Next.js plugin sets this — do not use `/` or repo root)

**Important — Build settings (fix “publish directory cannot be the same as base directory”):**

1. **Site configuration → Build & deploy → Continuous deployment → Build settings → Edit settings**
2. **Publish directory:** clear the field completely (empty), then **Save**
3. **Build command:** should be `npm run build` (or leave empty to use `netlify.toml`)
4. Do **not** set Publish to `.`, `/`, or the repo folder name

### 3.3 Environment variables — connect MongoDB Atlas (required)

Netlify does not run MongoDB on your computer. You **must** link your **Atlas** database here.

Before deploy finishes (or right after), go to:

**Site configuration → Environment variables → Add a variable**

Add these **3 variables**:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | Paste the **MongoDB Atlas** connection string from **Part 1.5** | Example: `mongodb+srv://user:pass@cluster....mongodb.net/nayan?retryWrites=true&w=majority` — must include `/nayan` |
| `JWT_SECRET` | Any long random text, e.g. `nayan_jwt_prod_8f3k2m9x7q1w5e6r` | Keep secret; used for sign-in cookies |
| `ADMIN_DELETE_CODE` | Your delete code, e.g. `nayan_delete_2026` | Same as local `.env.local` or a new one |

**Checklist for `MONGODB_URI`:**
- [ ] From Atlas (starts with `mongodb+srv://`), not `mongodb://127.0.0.1`
- [ ] Password replaced (no `<password>` placeholder)
- [ ] Database name `/nayan` is in the URL
- [ ] Atlas **Network Access** includes `0.0.0.0/0` (Part 1.4)

Click **Save**, then **Trigger deploy** if the site was already built without these variables.

### 3.4 Deploy
1. Click **Deploy site** (or **Trigger deploy** if already started)
2. Wait 2–5 minutes until status is **Published**
3. Your site URL appears at the top, e.g.:
   ```
   https://random-name-12345.netlify.app
   ```

### 3.5 Custom site name (optional)
1. **Site configuration → Domain management → Options**
2. **Change site name** → e.g. `nayan-r` → URL becomes:
   ```
   https://nayan-r.netlify.app
   ```

---

## Part 4 — Create admin account (first time)

After deploy, create the admin user in Atlas.

### On your PC (one time)

1. Open `.env.local` and temporarily set Atlas URI:
   ```env
   MONGODB_URI=mongodb+srv://nayanadmin:YOUR_PASSWORD@cluster....mongodb.net/nayan?retryWrites=true&w=majority
   JWT_SECRET=same_as_netlify
   ADMIN_DELETE_CODE=same_as_netlify
   ```

2. Run seed script:
   ```powershell
   cd "d:\Nayan Anna Prsonal\nayan-dashboard"
   npm run seed:admin
   ```

3. You should see:
   ```
   Admin created successfully!
   Email: admin@nayan.com
   Password: admin123
   ```

4. Open your live Netlify URL → **Sign In** with:
   - Email: `admin@nayan.com`
   - Password: `admin123`

5. **Change admin password later** (recommended) by updating in Atlas or adding a change-password feature.

---

## Part 5 — Test your live site

Checklist:

- [ ] Home page loads (`https://your-site.netlify.app`)
- [ ] **Sign Up** creates a new user
- [ ] **Sign In** works for user and admin
- [ ] User dashboard: incoming / outgoing entries save
- [ ] Admin dashboard shows all users
- [ ] Delete user works with delete code

---

## Part 6 — Update site after changes

When you edit code on your PC:

```powershell
cd "d:\Nayan Anna Prsonal\nayan-dashboard"
git add .
git commit -m "Describe your change"
git push
```

Netlify auto-rebuilds in 2–3 minutes.

---

## Troubleshooting

### Build failed on Netlify
- Open **Deploy log** and read the red error line
- Common fix: ensure `package.json` and `netlify.toml` are pushed to GitHub

### “Your publish directory cannot be the same as the base directory”
- **Cause:** Netlify UI has **Publish directory** set to the repo root (shows as `publish: /opt/build/repo` in the deploy log).
- **Fix:** **Site configuration → Build & deploy → Build settings → Edit** → **clear Publish directory** (leave empty) → Save → **Trigger deploy**.
- Do **not** add `publish = "."` to `netlify.toml` for this Next.js app — `@netlify/plugin-nextjs` manages output.

### "Cannot connect to MongoDB" / Sign up fails
- Check `MONGODB_URI` in Netlify env variables (no spaces, password URL-encoded if it has `@#` etc.)
- Atlas → Network Access must include `0.0.0.0/0`
- Redeploy after changing env: **Deploys → Trigger deploy**

### Sign in works locally but not on Netlify
- `JWT_SECRET` must be set on Netlify
- Clear browser cookies for the site and try again

### Image upload does not show on live site
- Netlify serverless storage is temporary. Text and amounts still work.
- For permanent images, use Cloudinary later (optional upgrade).

### Password special characters in MongoDB URI
If password has `@`, `#`, `%`, encode them:
- `@` → `%40`
- `#` → `%23`
- Or use a password without special characters in Atlas

---

## Alternative: Vercel (also free)

If Netlify has issues:

1. [https://vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → import same repo
3. Add same 3 environment variables
4. Deploy → URL like `https://nayan-dashboard.vercel.app`

Vercel is made by the Next.js team and works very well for this project.

---

## Summary

| Step | Service | Cost |
|------|---------|------|
| Database | MongoDB Atlas M0 | Free |
| Code | GitHub | Free |
| Hosting | Netlify | Free |
| Domain | `*.netlify.app` | Free |

Your live app = **Netlify URL** + **Atlas database** + **env variables**.

---

## Security reminders

- Never commit `.env.local` to GitHub
- Use strong `JWT_SECRET` on production
- Change default admin password after first login
- Keep `ADMIN_DELETE_CODE` private
