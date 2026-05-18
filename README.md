# STOCKLY — Full-Stack Stock Market Application

STOCKLY is a full-stack stock market simulation platform built with the MERN stack (MongoDB, Express, React, Node.js). It is split into **three independently running applications** that must all be started to use the platform.

---

## 📁 Project Structure

```
STOCKLY/
├── backend/          # Node.js + Express REST API (port 3002)
├── frontend/         # React landing page / marketing site (port 3000)
└── dashboard/        # React trading dashboard with charts (port 3001)
```

| Component   | Tech Stack                                          | Default Port |
|-------------|-----------------------------------------------------|--------------|
| `backend`   | Node.js, Express, Mongoose, MongoDB Atlas, dotenv   | **3002**     |
| `frontend`  | React (Create React App), React Router DOM          | **3000**     |
| `dashboard` | React (CRA), MUI, Chart.js, Axios, React Router DOM | **3001**     |

---

## ✅ Prerequisites

Make sure the following are installed on your machine **before** you begin:

| Tool       | Version  | Download Link                        |
|------------|----------|--------------------------------------|
| Node.js    | v16+     | https://nodejs.org/                  |
| npm        | v8+      | *(bundled with Node.js)*             |
| Git        | any      | https://git-scm.com/                 |

> **No local MongoDB installation is required.** The project connects to a hosted **MongoDB Atlas** cluster via the `.env` file already included in the repo.

---

## 🚀 Setup & Launch Instructions

You need **3 separate terminal windows** — one for each part of the application.

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/akchoudhary1114773136aA/STOCKLY.git
cd STOCKLY
```

---

### Step 2 — Backend Setup

> **Open Terminal 1** and run the following:

```bash
cd backend
npm install
```

Verify that a `.env` file exists inside the `backend/` folder. It should already be present and look like this:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.ka4owsi.mongodb.net/stockly?appName=Cluster0
PORT=3002
```

> ⚠️ If the `.env` file is missing (e.g. you cloned a version without it), create it manually in the `backend/` folder with the values above. Ask the project owner for the correct credentials.

Start the backend server:

```bash
npm start
```

✅ You should see:
```
App started!
```
The backend API is now running at **http://localhost:3002**

---

### Step 3 — Frontend Setup (Landing Page)

> **Open Terminal 2** and run the following:

```bash
cd frontend
npm install
npm start
```

✅ React will automatically open **http://localhost:3000** in your browser.  
This is the **marketing / landing page** of STOCKLY.

---

### Step 4 — Dashboard Setup (Trading Panel)

> **Open Terminal 3** and run the following:

```bash
cd dashboard
npm install
npm start
```

> Since port 3000 is already in use by the frontend, React will prompt you:  
> `Would you like to run the app on another port instead? (Y/n)`  
> **Press `Y`** — the dashboard will start on **http://localhost:3001**.

✅ The trading dashboard with holdings, positions, orders, and charts is now live at **http://localhost:3001**

---

## 🔗 API Endpoints (Backend)

The backend exposes the following REST endpoints:

| Method | Endpoint        | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | `/allHoldings`  | Returns all stock holdings from DB   |
| GET    | `/allPositions` | Returns all open positions from DB   |
| POST   | `/newOrder`     | Places a new buy/sell order          |

All endpoints run on `http://localhost:3002`.

---

## 🗂️ Data Models

The MongoDB database (`stockly`) uses three collections:

- **Holdings** — stocks owned by the user (name, qty, avg price, current price, net %, day %)
- **Positions** — open intraday positions (product type, name, qty, avg, price, net, day, isLoss)
- **Orders** — placed orders (name, qty, price, mode)

---

## 🌐 Application URLs Summary

| Application      | URL                    |
|------------------|------------------------|
| Frontend (Landing Page)  | http://localhost:3000 |
| Dashboard (Trading)      | http://localhost:3001 |
| Backend API              | http://localhost:3002 |

---

## 🛠️ Troubleshooting

### `npm install` fails or takes too long
- Make sure you are running the command **inside** the correct subdirectory (`backend/`, `frontend/`, or `dashboard/`), not in the root `STOCKLY/` folder.
- Try deleting `node_modules/` and `package-lock.json` and running `npm install` again.

### Port already in use
- If you see `EADDRINUSE` errors, find and kill the process using the port:
  ```powershell
  # Find which process is using port 3002
  netstat -ano | findstr :3002
  # Then kill it (replace <PID> with the actual process ID)
  taskkill /PID <PID> /F
  ```

### Backend shows "DB connection failed"
- Check your internet connection (the project uses MongoDB Atlas — a cloud database).
- Ensure the `.env` file exists in `backend/` and the `MONGO_URL` value is correct.
- Confirm your IP address is whitelisted in MongoDB Atlas (or the cluster is set to allow all IPs: `0.0.0.0/0`).

### Dashboard shows no data (empty holdings/positions)
- Make sure the **backend** is running first before opening the dashboard.
- The dashboard fetches data from `http://localhost:3002`. Confirm the backend is up.

### Windows: `nodemon` not recognized
- This is installed as a dev dependency. Try running the backend with:
  ```bash
  npx nodemon index.js
  ```
  or install it globally:
  ```bash
  npm install -g nodemon
  ```

---

## 📦 Dependencies Summary

### Backend (`/backend`)
- `express` — HTTP server framework
- `mongoose` — MongoDB ODM
- `dotenv` — loads `.env` variables
- `cors` — enables cross-origin requests from the frontend/dashboard
- `body-parser` — parses incoming JSON request bodies
- `nodemon` *(dev)* — auto-restarts server on file changes

### Frontend (`/frontend`)
- `react`, `react-dom` — core React library
- `react-router-dom` — client-side routing for the landing page

### Dashboard (`/dashboard`)
- `react`, `react-dom` — core React library
- `react-router-dom` — routing between dashboard views
- `axios` — HTTP client to call the backend API
- `@mui/material`, `@mui/icons-material` — Material UI components
- `chart.js`, `react-chartjs-2` — charts for holdings/portfolio visualisation

---

## 📝 Known Limitations / TODOs

- **Authentication** — `passport` and `passport-local-mongoose` are listed as backend dependencies but auth routes are not yet implemented. The API is currently open/unprotected.
- **Database Seeding** — commented-out seed routes (`/addHoldings`, `/addPositions`) exist in `backend/index.js`. To populate the DB with sample data, uncomment those routes, hit the endpoint once, then re-comment them.
- **Application Consolidation** — `frontend` and `dashboard` are two separate React apps. Future work may combine them into a single app with shared routing.
