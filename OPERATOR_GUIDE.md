# TourReady Operator — User & Admin Guide

A comprehensive guide to using and managing the TourReady Operator training platform.

---

## Table of Contents

1. [What This Website Does](#what-this-website-does)
2. [Starting the Website (Local)](#starting-the-website-local)
3. [Accessing the Website](#accessing-the-website)
4. [Bringing It Online (Public Access)](#bringing-it-online-public-access)
5. [Using the Website — Feature Guide](#using-the-website--feature-guide)
6. [Navigating Each Section](#navigating-each-section)
7. [Saving Your Training Progress](#saving-your-training-progress)
8. [Stopping the Website](#stopping-the-website)
9. [Troubleshooting](#troubleshooting)

---

## What This Website Does

**TourReady Operator** is an AI-powered certification training platform for forklift and telehandler operators working in concert and festival production environments.

### Key Features:
- **15 training modules** covering OSHA rules, safety signals, rigging, fatigue management, and real-world hazards
- **139 scenario-based test questions** — you make decisions like you're on the floor at 2:00 AM
- **AI Safety Tutor** — an AI instructor who grades your answers and explains techniques
- **Offline-capable** — everything runs locally, no internet required during training
- **Certification records** — save your progress as a PDF-like operator record

---

## Starting the Website (Local)

### Step 1: Open a Terminal

On Windows:
- Press `Win + R`, type `cmd`, and press Enter
- Or search for "Command Prompt" or "PowerShell"

### Step 2: Navigate to the Project Folder

In the terminal, type:
```
cd E:\Forklift_Training_Project\tourready-operator
```

Press Enter.

You should see:
```
E:\Forklift_Training_Project\tourready-operator>
```

### Step 3: Start the Development Server

Type:
```
npm run dev
```

Press Enter and wait 10–15 seconds.

You should see output like:
```
✓ Ready in 10.7s
✓ Compiled / in 3.2s
```

This means the server is running and ready. **Leave this terminal window open** — it keeps the website alive.

### Step 4: You're Done

The website is now running on your computer at: **http://localhost:47283**

---

## Accessing the Website

### On Your Computer (Local Access)

Open any web browser (Chrome, Firefox, Edge, etc.) and go to:
```
http://localhost:47283
```

You should see the TourReady Operator home page with the hero headline and training modules.

### On Another Computer (Same Wi-Fi Network)

If someone else is on your Wi-Fi, they can access your server at:
```
http://192.168.0.91:47283
```

(This only works while your dev server is running.)

---

## Bringing It Online (Public Access)

### What This Does

You can temporarily make the website publicly accessible to anyone on the internet via a secure Cloudflare tunnel. This is useful for sharing the training with a distributed team or reviewing it on a phone/tablet remotely.

### Prerequisites

The first time you do this, we need to install Cloudflare's tunneling tool. If you've already done this, skip to **Step 4** below.

### Step 1: Install Cloudflare Tunneling Tool (First Time Only)

In a **new terminal window** (leave your dev server terminal open), type:
```
winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements
```

Press Enter and wait for the installation to finish. You should see: `Successfully installed`

### Step 2: Start the Tunnel

In the same terminal, type:
```
cloudflared tunnel --url http://localhost:47283
```

Press Enter and wait 5 seconds.

You should see output like:
```
|  https://roughly-additions-lounge-covers.trycloudflare.com  |
```

This is your **public URL** — anyone with this link can access your site.

### Step 3: Share the Link

Copy the URL (e.g., `https://roughly-additions-lounge-covers.trycloudflare.com`) and share it with your team. They can open it in any browser, anywhere in the world.

### Step 4: Keep Both Windows Open

You now have:
- **Terminal 1** — the dev server (npm run dev) — keep it open
- **Terminal 2** — the Cloudflare tunnel — keep it open

Both must stay running for the public link to work.

### Step 5: Stop When You're Done

To take the site offline:
1. In **Terminal 2** (Cloudflare), press `Ctrl + C` to stop the tunnel
2. In **Terminal 1** (dev server), press `Ctrl + C` to stop the server
3. Close both terminals

The public link will no longer work, and the site stops running.

---

## Using the Website — Feature Guide

### The Home Page

When you first visit, you see:
- A large headline: **"Master the Concert/Event Production Forklift Training Program"**
- Six hazard cards describing real production challenges (wind effects, rigging zones, fatigue, etc.)
- A "How it Works" section explaining the four-step training loop
- Two green buttons: **"Enter the Training Hub"** and **"Open Safety Engine"**

### The Navigation Menu (Top of Every Page)

At the top, you see:
- **TourReady Operator** logo (left side)
- **Training Hub** — where you take courses and do scenario tests
- **Safety Engine** — an interactive simulator for practicing decisions
- **Knowledge Base** — searchable reference for all techniques and rules
- **Certification** — your progress and saved records
- **Continue Training** — jumps back to where you left off

---

## Navigating Each Section

### 1. Training Hub

**How to get there:** Click the green **"Enter the Training Hub"** button on the home page.

**What you see:**
- A grid of 15 training modules (Module 0 through Module 14, plus a Capstone)
- Each module card shows:
  - The module title (e.g., "Basic Machine Controls")
  - A brief summary
  - Number of scenarios (e.g., "8 scenarios")
  - Pass requirement (e.g., "60% to pass")
  - A progress bar (fills as you complete it)

**How to start training:**
1. Click any module card
2. Read the theory sections (text and callout boxes)
3. After reading, scroll to the bottom and click **"Begin Scenarios"**
4. Answer each scenario question:
   - Read the situation (the prompt)
   - Type your answer in the text box
   - Click **"Submit Answer"**
5. The AI grades your answer instantly and explains the correct technique
6. After 60% of the module's scenarios, you pass the module

**Example Scenario:**
```
Prompt: "You're carrying a 3,000 lb flight case and need to drive 40 feet 
to the truck bay. How do you carry it?"

Your answer: "Low and tilted back, 4-8 inches off the ground"

AI Feedback: "Correct. The Low-Travel Rule keeps the load stable and 
gives you better visibility of the ground. Never travel high."
```

### 2. Safety Engine (Simulator)

**How to get there:** Click **"Open Safety Engine"** or select it from the menu.

**What it is:**
An interactive decision-making simulator. You respond to real-time scenarios as if you're on a concert floor at 2:00 AM.

**How it works:**
1. A scenario loads (e.g., "Wind is gusting to 17 mph and you're about to raise a 10,000 lb LED wall")
2. You see multiple-choice options or a text prompt
3. You make a decision
4. The system grades you and explains consequences

**Why it's different from Training Hub:**
- Training Hub is guided learning with detailed feedback
- Safety Engine is a stress test — you respond quickly without hints

### 3. Knowledge Base (Resources)

**How to get there:** Click **"Knowledge Base"** in the menu.

**What you see:**
- A searchable library of all 15 modules
- Glossary of terms (e.g., "Center of Gravity," "Spotter")
- List of all 25+ named techniques with one-line definitions
- Quick reference for OSHA rules and hand signals

**How to use it:**
- Type a keyword in the search box (e.g., "wind," "rigging," "fatigue")
- Results show which modules cover that topic
- Click a result to jump to that section

### 4. Certification

**How to get there:** Click **"Certification"** in the menu.

**What you see:**
- A progress dashboard showing:
  - Which modules you've passed
  - Your overall completion %
  - Your operator name and certification date
- A **"Download Certification"** button

**How to save your record:**
1. Complete at least one module (pass 60% of scenarios)
2. Go to Certification page
3. Click **"Download Certification"**
4. Your browser saves a record with your name, date, and completed modules
5. You can print or email this record

---

## Saving Your Training Progress

### Automatic Save
- Every time you submit a scenario answer, your progress auto-saves to your device
- Your browser remembers which modules you've passed, your scores, and the date you started

### Manual Export
To back up your progress or print a certificate:
1. Go to **Certification** page
2. Click **"Download Certification"**
3. Your browser downloads a PDF-like file with your name, completion date, and module list

### Important
- Progress is saved **per browser, per device**
- If you clear your browser's cache/cookies, you may lose progress
- Each person who uses the site gets their own separate progress record

---

## Stopping the Website

### To Stop the Dev Server (Local Only)

1. Find the terminal window running `npm run dev`
2. Press `Ctrl + C` (hold Control, then press C)
3. Type `Y` if prompted, then press Enter
4. The terminal will show `^C` and close

The website is now offline locally. Public links (if you started a tunnel) also stop working.

### To Stop the Cloudflare Tunnel (Public Access Only)

1. Find the terminal window running `cloudflared tunnel ...`
2. Press `Ctrl + C`
3. The terminal will close

The public URL (the `https://...trycloudflare.com` link) no longer works, but your local server (if still running) continues to serve `http://localhost:47283`.

### To Stop Everything

1. Stop the Cloudflare tunnel (`Ctrl + C` in tunnel terminal)
2. Stop the dev server (`Ctrl + C` in dev server terminal)
3. Close both terminals

---

## Troubleshooting

### Problem: "Address already in use" Error

**Cause:** Something is already running on port 47283.

**Fix:**
1. Find any other terminal running `npm run dev`
2. Stop it with `Ctrl + C`
3. Try `npm run dev` again

### Problem: Website Shows "Cannot GET /" or Blank Page

**Cause:** Dev server crashed or didn't start properly.

**Fix:**
1. Stop the server (`Ctrl + C`)
2. Type `npm run dev` again
3. Wait 15 seconds for it to compile
4. Refresh your browser (Ctrl + R or F5)

### Problem: Cloudflare Tunnel Won't Start

**Cause:** `cloudflared` isn't installed or isn't in your PATH.

**Fix:**
1. Close the tunnel terminal
2. Open a new terminal
3. Type `cloudflared --version` to test
4. If not found, reinstall: `winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements`
5. Open a new terminal and try `cloudflared tunnel --url http://localhost:47283` again

### Problem: Tunnel Link Shows "Error 1000: DNS Query REFUSED"

**Cause:** Temporary network issue or Cloudflare service issue.

**Fix:**
1. Stop the tunnel (`Ctrl + C`)
2. Wait 10 seconds
3. Start it again: `cloudflared tunnel --url http://localhost:47283`
4. Use the new URL provided

### Problem: My Progress Disappeared

**Cause:** Browser cache was cleared, or you're using a different browser/device.

**Fix:**
- Progress is saved per browser, per device
- If you switched browsers or cleared cache, progress may be lost
- Always download your Certification before clearing your browser

### Problem: The Website Looks Broken (Missing Styles, Weird Layout)

**Cause:** Browser cache is outdated.

**Fix:**
1. Press `Ctrl + Shift + Delete` to open browser cache settings
2. Clear "Cookies and other site data"
3. Refresh the page (F5 or Ctrl + R)
4. If still broken, stop the dev server, wait 5 seconds, and restart it

### Problem: I Can't Access the Public Link on My Phone

**Cause:** Firewall blocking, or you copied the URL wrong.

**Fix:**
1. Double-check the URL — it should start with `https://` (not `http://`)
2. Make sure both terminals (dev server + tunnel) are still running
3. Try accessing from a different phone or browser
4. If on the same Wi-Fi, try the local URL instead: `http://192.168.0.91:47283`

---

## Quick Cheat Sheet

| Task | Command | Where |
|------|---------|-------|
| Start the website (local) | `npm run dev` | Terminal in `E:\Forklift_Training_Project\tourready-operator` |
| Access locally | Open `http://localhost:47283` | Web browser |
| Make it public | `cloudflared tunnel --url http://localhost:47283` | New terminal window |
| Stop everything | `Ctrl + C` in both terminals | Both terminal windows |
| Save certification | Go to Certification → Download Certification | Website |
| Reset progress | Clear browser cache | Browser settings |

---

## Need Help?

If something isn't working:
1. Check the terminal for error messages
2. Look for your issue in the **Troubleshooting** section above
3. If still stuck, note the error message and describe what you were doing when it happened

Good luck with your forklift training! 🚜⚠️

