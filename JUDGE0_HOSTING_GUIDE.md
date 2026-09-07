# How & Where to Host Judge0 for Free (Complete Guide)

Judge0 has two versions:
1. **RapidAPI Hosted Judge0**: Charges per submission or requires a paid subscription.
2. **Judge0 CE (Community Edition)**: **100% Free & Open-Source** under GPL-3.0. You can self-host it on any server with **unlimited submissions**.

In addition, your app **now has an automatic free compiler engine built-in (Piston GCC 10.2.0)** so your students can compile real C code **right now with zero setup and zero cost!**

---

## 1. Where to Host Judge0 for Free or Cheap

### Option A: Oracle Cloud Free Tier (Recommended — 100% FREE FOREVER)
- **Cost**: **$0.00 / month forever** (No credit card charges).
- **Specs**: Up to **4 OCPU ARM Ampere cores + 24 GB RAM + 200 GB Storage** (Massive capacity for compiling 100+ concurrent students).
- **Steps**:
  1. Sign up at [cloud.oracle.com](https://cloud.oracle.com).
  2. Create an **Ubuntu 22.04 LTS** instance under **Always Free Eligible**.
  3. SSH into the server:
     ```bash
     ssh ubuntu@<your-instance-ip>
     ```
  4. Install Docker & Docker Compose:
     ```bash
     sudo apt update && sudo apt install -y docker.io docker-compose
     sudo systemctl enable --now docker
     ```
  5. Copy `docker-compose.judge0.yml` to the server and start it:
     ```bash
     docker compose -f docker-compose.judge0.yml up -d
     ```
  6. Open port `2358` in Oracle Cloud Security Lists.
  7. In your `.env`:
     ```env
     VITE_JUDGE0_API_URL=http://<your-oracle-ip>:2358
     VITE_JUDGE0_API_KEY=
     ```

---

### Option B: Budget VPS (Hetzner Cloud or DigitalOcean — $3.50 to $5/mo)
- **Hetzner Cloud (CX22)**: €3.79/month for 2 vCPU, 4 GB RAM. Ultra-fast European/US data centers.
- **DigitalOcean**: $4–$6/month droplet.
- **Steps**:
  1. Spin up an Ubuntu 24.04 droplet/server.
  2. Run:
     ```bash
     curl -fsSL https://get.docker.com | sh
     ```
  3. Run Judge0:
     ```bash
     docker compose -f docker-compose.judge0.yml up -d
     ```
  4. Point your `.env` to `http://<your-vps-ip>:2358`.

---

### Option C: Run Locally with Docker on Your Machine (Development — $0)
If you have Docker Desktop installed on your Windows or Mac:
1. In the project root directory, run:
   ```bash
   docker compose -f docker-compose.judge0.yml up -d
   ```
2. Your local Judge0 server will be running on `http://localhost:2358`!
3. In your `.env`:
   ```env
   VITE_JUDGE0_API_URL=http://localhost:2358
   VITE_JUDGE0_API_KEY=
   ```

---

## 2. Zero-Config Free Fallback Built Into Your App!

You don't need to deploy Judge0 today to start testing.
Your application's `src/lib/judge0.ts` is configured with an **automatic zero-cost compiler engine**:
- If `VITE_JUDGE0_URL` is set to your own server, it uses your private Judge0.
- If no server is configured, it automatically executes C code via the **Free Public Piston Engine (emkc.org GCC 10.2.0)**.
- **Features**:
  - Genuine GCC 10.2.0 compilation
  - Real `stdout`, `stderr`, and compilation error diagnostics
  - Zero API keys needed
  - Completely free for testing and development
