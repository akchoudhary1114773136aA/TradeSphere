# Plan: Fixing "DB connection failed" Error

## What Is Happening

In `backend/index.js`, the server starts on port 3002 first, then attempts to connect to MongoDB Atlas:

```js
// index.js — lines 224–229
app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri).catch((err) => {
    console.error("DB connection failed:", err.message);  // <-- this line triggers
  });
});
```

So "App started!" prints immediately (the Express server is fine), but then `mongoose.connect(uri)` fails and the error is caught and logged. **The API server runs, but it has no database — all data endpoints will return empty arrays or errors.**

---

## Possible Causes

### Cause 1 — Your IP Address Is Not Whitelisted in MongoDB Atlas (Most Common)
MongoDB Atlas requires your current public IP to be explicitly allowed in the cluster's Network Access list. By default, a new Atlas cluster only allows the IP that was used during setup. If you are on a different machine, network, or even on a different ISP session, your IP will have changed and access will be blocked.

**How to verify:** The error message in your terminal will usually say something like:
```
MongoServerError: connection <monitor> to ... closed
```
or
```
Could not connect to any servers in your MongoDB Atlas cluster.
```

---

### Cause 2 — The `.env` File Is Missing or Malformed
The backend reads `MONGO_URL` from `backend/.env` via `dotenv`. If the file:
- Does not exist in the `backend/` folder
- Has a typo in the variable name (e.g. `MONGO_URI` instead of `MONGO_URL`)
- Has extra spaces around the `=` sign
- Has quotes around the value (e.g. `MONGO_URL="mongodb+srv://..."` — dotenv handles this, but some editors add hidden characters)

...then `uri` will be `undefined`, and `mongoose.connect(undefined)` will fail immediately.

**How to verify:** Add a temporary log line before `mongoose.connect`:
```js
console.log("Connecting to:", process.env.MONGO_URL);
```
If it prints `undefined`, the `.env` file is not being read correctly.

---

### Cause 3 — Internet Connection Is Down or Blocked
MongoDB Atlas is a **cloud-hosted** database. There is no local MongoDB running. If your internet is down, a firewall is blocking outbound connections on port `27017` (the default MongoDB port), or your corporate/university network restricts external database connections, the connection will time out and fail.

---

### Cause 4 — Atlas Cluster Is Paused or Deleted
Free-tier MongoDB Atlas clusters (`M0`) automatically **pause after 60 days of inactivity**. When paused, the connection string is still valid but no connections will be accepted.

**How to verify:** Log in to https://cloud.mongodb.com and check if the cluster shows a "Paused" badge.

---

### Cause 5 — Wrong or Expired Credentials in the Connection String
The `MONGO_URL` in `.env` contains the username and password embedded in the URI:
```
mongodb+srv://<username>:<password>@cluster0...
```
If the database user's password was changed or the user was deleted in Atlas, authentication will fail.

**Error message will look like:**
```
MongoServerError: bad auth : Authentication failed.
```

---

### Cause 6 — `node_modules` Not Installed / `dotenv` Not Installed
If `npm install` was never run inside the `backend/` folder, the `dotenv` package (and others) won't exist, and the whole startup will crash before even attempting a connection.

---

## Step-by-Step Fix Plan

### Step 1 — Confirm the `.env` File Exists and Is Correct

Navigate to `backend/` and verify:
```
STOCKLY/
└── backend/
    └── .env   ← this file must exist here
```

The content should be:
```env
MONGO_URL=mongodb+srv://akchoudhary24072004_db_user:XjscLQGNQbL6xph6@cluster0.ka4owsi.mongodb.net/stockly?appName=Cluster0
PORT=3002
```

- No quotes around the value
- No spaces around the `=`
- Variable name is exactly `MONGO_URL` (uppercase, no typo)

---

### Step 2 — Whitelist Your IP Address in MongoDB Atlas (Most Likely Fix)

1. Go to https://cloud.mongodb.com and log in with the project owner's account.
2. In the left sidebar, click **Network Access** (under Security).
3. Click **+ ADD IP ADDRESS**.
4. To allow access from any IP (easiest for development), enter `0.0.0.0/0` and click **Confirm**.
   > ⚠️ This is fine for development but should be restricted to specific IPs in production.
5. Wait ~30 seconds for the change to propagate, then restart the backend:
   ```bash
   npm start
   ```

---

### Step 3 — Check If the Atlas Cluster Is Paused

1. Log in to https://cloud.mongodb.com.
2. Go to **Database** in the left sidebar.
3. If your cluster shows a **"Paused"** label, click the three dots (`...`) next to it → **Resume**.
4. Wait for the cluster to resume (can take 1–2 minutes), then try `npm start` again.

---

### Step 4 — Verify Your Internet / Firewall Is Not Blocking Port 27017

Test whether port 27017 is reachable from your machine (run in PowerShell):
```powershell
Test-NetConnection -ComputerName cluster0.ka4owsi.mongodb.net -Port 27017
```

If `TcpTestSucceeded` is `False`, your network (firewall, VPN, or ISP) is blocking the connection.

**Fix options:**
- Disconnect from VPN if you are using one.
- Switch to a mobile hotspot to test if the issue is network-specific.
- Contact your network admin if on a corporate/university network.

---

### Step 5 — Verify `node_modules` Are Installed

Make sure you ran `npm install` inside the `backend/` folder:
```bash
cd backend
npm install
```

Confirm `node_modules/dotenv` exists after installation.

---

### Step 6 — Add a Debug Log to Confirm the URI Is Loading

Temporarily add this line to `backend/index.js` right before `mongoose.connect(uri)`:

```js
console.log("MONGO_URL is:", process.env.MONGO_URL ? "Loaded ✓" : "MISSING ✗");
```

- If it prints `MISSING ✗` → the `.env` file is not being read (fix Step 1).
- If it prints `Loaded ✓` but the connection still fails → the URI is fine, move to Steps 2–4.

Remove this log line once the issue is resolved.

---

## Quick Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | `backend/.env` file exists with correct `MONGO_URL` | ☐ |
| 2 | Your IP is whitelisted in MongoDB Atlas Network Access | ☐ |
| 3 | Atlas cluster is not paused | ☐ |
| 4 | Internet connection is active; port 27017 is not blocked | ☐ |
| 5 | `npm install` was run inside `backend/` | ☐ |

**In most cases for this project, fixing Step 2 (IP whitelist) resolves the error.**
