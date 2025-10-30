# VPS Setup Guide - First Steps

## When Your Hetzner VPS is Ready

You'll receive an email from Hetzner with your server details:
- **IP Address** (e.g., `123.45.67.89`)
- **Server Name** (e.g., `ubuntu-2gb-fsn1-1`)

---

## Step 1: Connect to Your VPS

### From Windows WSL or Linux Terminal:

```bash
# Replace YOUR_SERVER_IP with the IP from Hetzner email
ssh root@YOUR_SERVER_IP

# If prompted about authenticity, type: yes

# You should see the Ubuntu welcome message
```

**Expected output:**
```
Welcome to Ubuntu 22.04.x LTS (GNU/Linux ...)
```

---

## Step 2: First-Time Setup (Run These Commands)

Copy and paste these commands **one at a time**:

### Update System Packages
```bash
apt update && apt upgrade -y
```

### Set Timezone to Spain
```bash
timedatectl set-timezone Europe/Madrid
date  # Verify it shows correct time
```

### Create a Non-Root User (Security Best Practice)
```bash
# Create user 'deploy'
adduser deploy

# When prompted:
# - Password: Choose a strong password
# - Full Name: Press Enter (skip)
# - Other info: Press Enter (skip all)
# - Is this correct: Y

# Give sudo privileges
usermod -aG sudo deploy

# Add your SSH key to new user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### Configure Firewall (UFW)
```bash
# Allow SSH (IMPORTANT: Do this BEFORE enabling firewall!)
ufw allow 22/tcp

# Allow HTTP and HTTPS (for website)
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Node.js API port (we'll use 3001)
ufw allow 3001/tcp

# Enable firewall
ufw enable

# Verify rules
ufw status
```

---

## Step 3: Install Required Software

### Install Node.js 20 LTS
```bash
# Install curl if needed
apt install -y curl

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### Install pnpm
```bash
npm install -g pnpm
pnpm --version  # Should show 8.x.x or 9.x.x
```

### Install PostgreSQL 16
```bash
# Add PostgreSQL repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | tee /etc/apt/trusted.gpg.d/pgdg.asc

# Install PostgreSQL
apt update
apt install -y postgresql-16 postgresql-contrib-16

# Verify installation
systemctl status postgresql
# Press 'q' to exit

# PostgreSQL should show "active (running)"
```

### Install Nginx (Web Server)
```bash
apt install -y nginx
systemctl status nginx
# Press 'q' to exit

# Should show "active (running)"
```

### Install Git
```bash
apt install -y git
git --version  # Should show git version 2.x.x
```

---

## Step 4: Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# You'll see: postgres=#

# Run these SQL commands:
CREATE DATABASE mallorca_shuttle;
CREATE USER deploy WITH ENCRYPTED PASSWORD 'choose_a_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE mallorca_shuttle TO deploy;

# Exit PostgreSQL
\q
```

**Important:** Remember the password you set for the `deploy` user - you'll need it for the `.env` file!

---

## Step 5: Clone Repository

```bash
# Switch to deploy user
su - deploy

# Create projects directory
mkdir -p ~/projects
cd ~/projects

# Clone your repository
git clone https://github.com/chabelincwebs/mallorca-cycle-shuttle.git
cd mallorca-cycle-shuttle

# Verify files are there
ls -la
# You should see: backend/, content/, layouts/, static/, etc.
```

---

## Step 6: Set Up Backend

```bash
cd ~/projects/mallorca-cycle-shuttle/backend

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Update these values in `.env`:**
```env
# Database (use password from Step 4)
DATABASE_URL="postgresql://deploy:your_password_here@localhost:5432/mallorca_shuttle?schema=public"

# Server
NODE_ENV=production
PORT=3001
API_BASE_URL=http://YOUR_SERVER_IP:3001

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# VeriFactu HMAC (generate random string)
VERIFACTU_HMAC_SECRET=your-256-bit-hmac-secret-for-hash-chains

# (Leave other settings as-is for now, we'll add Stripe/SendGrid later)
```

**Save the file:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 7: Initialize Database

```bash
# Still in ~/projects/mallorca-cycle-shuttle/backend

# Generate Prisma Client
pnpm prisma:generate

# Create database tables
pnpm prisma:migrate

# You'll be asked "Enter a name for the new migration:"
# Type: initial_schema
# Press Enter
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database schema created successfully
```

---

## Step 8: Test the Backend

```bash
# Start development server
pnpm dev

# You should see:
# > tsx watch src/index.ts
# Server starting...
```

**From another terminal on your local machine, test:**
```bash
curl http://YOUR_SERVER_IP:3001/health

# Expected: {"status":"ok"}
```

**If it works, press `Ctrl+C` in the server to stop it.**

---

## ✅ You're Ready!

Your VPS is now set up with:
- ✅ Ubuntu 22.04 LTS
- ✅ Node.js 20
- ✅ PostgreSQL 16
- ✅ Nginx
- ✅ Firewall configured
- ✅ Database created
- ✅ Repository cloned
- ✅ Backend dependencies installed

---

## 🎯 Next Steps (When You Tell Me Your Server IP)

I'll help you:
1. Set up PM2 to keep the backend running 24/7
2. Configure Nginx as a reverse proxy
3. Set up SSL certificate (Let's Encrypt)
4. Build the Express.js API server
5. Implement authentication
6. Create the first API endpoints

---

## 📝 Important Information to Share

Once you're done with the above steps, tell me:
1. ✅ "VPS setup complete"
2. Your server IP address (I'll need it for Nginx config)
3. Any errors you encountered

Then we'll continue building! 🚀
