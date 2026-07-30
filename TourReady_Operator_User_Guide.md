# TourReady Operator — Complete User Guide

**Who this guide is for:** Anyone using the TourReady Operator website for the first time!
**How it's written:** Simply and step-by-step, like explaining it to someone who has never seen it before.

---

## Table of Contents

1. [What Is TourReady Operator?](#1-what-is-tourready-operator)
2. [Opening the Website](#2-opening-the-website)
3. [The Home Page — Your First Look](#3-the-home-page--your-first-look)
4. [The Training Hub — Your Main Control Center](#4-the-training-hub--your-main-control-center)
5. [Training Modules — Learning Lessons](#5-training-modules--learning-lessons)
6. [The Interactive Scenario Trainer — Practice Time](#6-the-interactive-scenario-trainer--practice-time)
7. [The Safety Engine Simulator — Testing What-Ifs](#7-the-safety-engine-simulator--testing-what-ifs)
8. [The Knowledge Base — Your Reference Library](#8-the-knowledge-base--your-reference-library)
9. [The AI Safety Tutor — Your Floating Helper](#9-the-ai-safety-tutor--your-floating-helper)
10. [The Certification Page — Earning Your Badge](#10-the-certification-page--earning-your-badge)
11. [Saving, Exporting, and Resetting Progress](#11-saving-exporting-and-resetting-progress)
12. [What the Colors Mean](#12-what-the-colors-mean)
13. [Helpful Tips](#13-helpful-tips)
14. [Quick Reference — Page-by-Page Summary](#14-quick-reference--page-by-page-summary)

---

## 1. What Is TourReady Operator?

Imagine you want to learn how to safely drive a really big forklift or telehandler (a tall machine that lifts heavy things way up high) at a music concert or festival. You can't just learn from any old book — concerts have special dangers like:

- Strong winds that can blow big LED screens over
- People working up in the air with heavy rigging
- Being tired late at night when your brain doesn't work as well
- Rushing because the concert truck needs to leave in 20 minutes
- Expensive gear worth hundreds of thousands of dollars that must NOT be dropped

**TourReady Operator is a training website** that teaches you everything about these dangers. It works like a school with:
- **Lessons** to read (the theory)
- **Practice tests** where you type answers (the scenarios)
- **A simulator** to test dangerous situations safely
- **A helper robot** you can ask questions (the AI tutor)
- **A certificate** you earn when you pass everything

The best part? **It works even without internet!** You can use it on a laptop at a concert venue with no WiFi.

---

## 2. Opening the Website

**Step 1:** Start the website by opening a terminal/command prompt on your computer and typing:

```
cd tourready-operator
npm run dev
```

**Step 2:** Open any web browser (like Chrome, Firefox, or Edge).

**Step 3:** In the address bar at the top of the browser, type:

```
http://localhost:3000
```

Then press **Enter**.

**Step 4:** The website will appear! It has a dark blue-black background with orange highlights. This is on purpose — it looks serious and professional, like a real safety training tool.

> **Note:** You don't need to sign up or create an account. The website remembers your progress automatically in your browser. No password needed!

---

## 3. The Home Page — Your First Look

When the website opens, the first page you see is the **Home Page** (also called the Landing Page). Think of it like the front cover of a book.

### What You See:

**At the very top** is the navigation bar (the menu strip). It has:
- The **TourReady Operator logo** on the left (a boom/fork shape with the name)
- Links to other pages: **Training Hub**, **Simulator**, **Resources**, **Certificate**
- On small phone screens, these links hide inside a **hamburger menu** (three little lines you tap to open)

**The big title area (called the Hero section):**
- A small orange dot with text: "Telehandler & Forklift · Concert & Festival Production" — this tells you what the site is about
- A large headline: **"Master the 2:00 AM load-out. Build unbreakable Stop-Work Authority."** — This means learning to do the job safely even at 2 in the morning when you're exhausted, and knowing when to say STOP
- A paragraph explaining what the site does
- Two big buttons:
  - **"Enter the Training Hub"** (orange button) — click this to start training
  - **"Open Safety Engine"** (darker button) — click this to go to the simulator

**Four stats below the buttons:**
- How many Modules there are (8 modules + 1 capstone final test)
- How many Field Scenarios (practice questions)
- How many Named Techniques (special skills with official names)
- "100% Offline-capable" — works without internet

**A red warning bar** below the stats that says: *"STOP" is the one command that overrides everything — issued loud, echoed by the crew, and never argued.* This is one of the most important safety rules — more on this later!

**The Hazards Section** shows 6 boxes explaining the real dangers:
1. **Wind & Sail Effect** — Big flat screens act like sails in the wind
2. **Active Rigging Zones** — Stuff falling from high up is very dangerous
3. **2:00 AM Fatigue** — Being tired makes you make mistakes
4. **Production Pressure** — People rushing you to go faster than is safe
5. **Custom, Expensive Gear** — Missing by one inch can break a $200,000 machine
6. **Dynamic Venues** — Muddy festival fields, slippery stage floors, wobbly surfaces

**The "How It Works" Section** shows 4 steps:
1. **Theory** (01) — Read the lessons
2. **Deliberate Practice** (02) — Answer real-world questions
3. **AI Feedback** (03) — Get graded and told what technique you used or missed
4. **Certification** (04) — Pass everything to get your certificate

**The Call-To-Action (CTA) Section** at the bottom has another big "Start Training" button.

### What To Do:
Click the big orange **"Enter the Training Hub"** button to get started!

---

## 4. The Training Hub — Your Main Control Center

The **Training Hub** (also called the Dashboard) is like the mission control room of the whole website. You get here by clicking "Enter the Training Hub" from the home page, or clicking "Training Hub" in the top menu.

The web address will change to: `http://localhost:3000/dashboard`

### Top Section — Your Progress Overview:

**The big circular ring (Progress Ring):**
- This is a round progress circle showing how far along you are
- The number in the middle shows "X/9 Modules" — how many you've passed out of 9 total
- The ring fills up orange as you complete modules
- When you pass everything, it turns **green** and says "Certified"!

**To the right of the ring:**
- Your **Certification Status** — says "In progress" (orange badge) until you're done, then "Certified" (green badge)
- A sentence telling you how many modules you've passed and how many scenarios you got right
- Two buttons: **"Continue Training"** (takes you to the next module you haven't passed yet) and **"View Certificate"** (only appears when you've passed everything)

### Quick Action Cards (Two boxes to the right):

**Safety Engine card:**
- Has a calculator icon
- Click it to go to the Safety Engine Simulator (more on that in Section 7)

**Knowledge Base card:**
- Has a chat bubble icon
- Click it to go to the Resources/Knowledge Base page (more on that in Section 8)

### Operator Name Box:

Below the quick actions is a box where you can **type your name**. This name will appear on your certificate when you earn it! Type your full name here early.

### The Module Grid — All Your Lessons:

The main area shows a grid of cards, one for each module (lesson). There are 8 regular modules plus 1 Capstone (final test). Each card shows:

- **An icon** (a little picture representing what the module is about)
- **The module number** (e.g., "Module 1") or "Final" for the Capstone
- **A colored status badge** in the top-right corner:
  - Gray "Not Started" — you haven't begun this one yet
  - Yellow "In Progress" — you started but haven't passed
  - Green "Passed" — you passed! 
  - Red "Retry" — you tried but didn't meet the score needed
- **The module title** (e.g., "Basic Controls & Startup Sequence")
- **A short description** of what you'll learn
- **At the bottom:** how many minutes to read, how many scenarios (practice questions), and your score percentage if you've attempted it
- **A small arrow icon** on the bottom right

**To open a module:** Click anywhere on the card. The card lifts up slightly when you hover over it (this is an animation to show it's clickable).

### Top-Right Buttons (Export, Import, Reset):

In the top-right of the dashboard are three small buttons:
- **Export** (download icon) — saves your progress as a file
- **Import** (upload icon) — loads a progress file
- **Reset** (circular arrow icon) — deletes all your progress and starts over (**WARNING: this can't be undone!**)

More detail on these in Section 11.

---

## 5. Training Modules — Learning Lessons

When you click on a module card, you go to that module's page. The web address will look like: `http://localhost:3000/modules/basic-controls`

Each module has two big parts: **Theory** (reading) and **Practice** (scenarios).

### The Module Header:

At the very top of the page:
- A **"← Training Hub"** link to go back to the dashboard
- A big orange icon showing the topic
- The **module number** (like "Module 1") or "Final Assessment" for the Capstone
- A **status badge** showing if it's passed, not started, etc.
- The **module title** (e.g., "Basic Controls & Startup Sequence")
- A **subtitle** giving a bit more detail
- How many minutes it takes to read and how many scenarios it has
- The **pass mark** — what score percentage you need to pass (usually 60%)

### The "Why This Matters" Box:

Just below the header is an orange box with a triangle warning icon. This explains WHY this particular topic is important — usually with a real story or consequence from actual concert work. Read this carefully! It tells you what could go wrong if you don't know this stuff.

### The Theory Sections (Reading Part):

The reading section comes in organized blocks. Each block may have:

**A numbered heading** — like "1. Starting the Machine" — tells you what this section covers

**A highlighted sentence (lede)** — displayed with a colored left border, this is the most important single sentence of the section. It's like the key takeaway.

**Body paragraphs** — normal reading text explaining everything in detail

**Numbered steps** — when there's a procedure (a set of things to do in order), they appear as a numbered list

**Callout boxes** — these are special highlighted boxes that come in three types:

> **TOUR REALITY (orange left bar):**
> These tell you how things ACTUALLY work on a real concert tour — sometimes different from the textbook. They start with "TOUR REALITY" in small caps.

> **CORE DRILL (blue left bar):**
> These are the key techniques and procedures you absolutely must learn. They start with "CORE DRILL" in small caps.

> **HARD RULE (red left bar):**
> These are rules you must NEVER break. These are the most serious. They start with "HARD RULE" in small caps.

**How to read the theory:**
1. Read the "Why This Matters" box first to understand the stakes
2. Read each section heading to get an overview
3. Read the lede (highlighted sentence) — if you only remember one thing, remember this
4. Read the full body paragraphs
5. Pay extra attention to any **HARD RULE** callouts — these are non-negotiable safety rules

### The Practice Divider:

After all the reading, you'll see a horizontal line with the words **"DELIBERATE PRACTICE"** in the center. This marks where the reading ends and the interactive practice begins.

### Navigation at the Bottom:

At the very bottom of the module page are two navigation buttons:
- **← Previous Module** (on the left) — goes to the module before this one
- **Next Module →** (on the right) — goes to the next module
- On the very last module (Capstone), the right button says **"Get Certified →"** instead

---

## 6. The Interactive Scenario Trainer — Practice Time

Below the "Deliberate Practice" divider is the **Interactive Scenario Trainer**. This is the heart of the whole website — where you actually practice making decisions.

Think of it like a chat conversation with a strict instructor who asks you hard questions about real situations.

### The Trainer Interface:

**The header bar** across the top shows:
- A sparkles icon and "Interactive Scenario Trainer"
- Once you start: how many scenarios you've answered correctly out of the total, and a progress bar

### Starting the Practice (Intro Screen):

Before you begin, you'll see a screen with:
- The sparkles icon
- "Begin Interactive Scenarios" as the title
- A description telling you how many scenarios there are and what the pass mark is
- A big **"Start X Scenarios →"** button

**Click that button to begin!**

### How the Practice Works:

Once you start, the screen changes to look like a chat conversation. Here's what happens:

**Step 1 — The AI gives you a situation:**
The trainer (shown as "AI" in a small circle) will describe a real-world scenario. For example:
> *"You're on a festival mud ground preparing for a 12,000 lb pick. The wind just picked up to 17 mph and your tour manager is counting down from the stage. What do you do?"*

Above the scenario you'll see small text like: "Scenario 2 of 4 · drilling: Wind Threshold Rule" — this tells you which scenario number you're on and which safety technique it's testing.

**Step 2 — You type your answer:**
At the bottom of the screen is a text box. **Type your answer** exactly as you would say it if you were actually on the job. You need to type a real answer — the system won't accept one or two words.

- You can press **Enter** to submit (or click the orange send button with an arrow icon)
- Press **Shift + Enter** if you want to add a new line without submitting

**Step 3 — The AI grades your answer:**
After you submit, you'll see three animated dots (•••) showing the trainer is "thinking." Then the result appears.

The feedback bubble shows:
- A green **"✓ Correct"** badge, OR a red **"✗ Not Quite"** badge
- The name of the technique you were being tested on (e.g., "Wind Threshold Rule")
- Sometimes a small "offline" label if it was graded without internet
- An explanation of what the right answer was and what technique applies

**Step 4 — Next scenario:**
After about half a second, the next scenario automatically appears. You keep answering until you've done all the scenarios for that module.

### Important Tips for Typing Answers:

- Write like you're actually on the floor at a concert venue
- Use the specific words and techniques you learned in the reading
- Don't write "I don't know" or very short answers — the system needs enough words to grade
- If you mention the right safety technique (like "call STOP" or "check wind speed" or "clear the rigging zone"), you're on the right track
- If you say things that are UNSAFE (like "just do the lift anyway" or "ignore the wind"), you will fail that scenario

### The Results Screen:

After the last scenario, a results panel appears:

**If you PASSED** (got enough right):
- A green trophy icon appears
- "Module Passed" in big text
- Your score like "3/4 · 75%"
- A congratulations message
- A **"Replay Scenarios"** button if you want to practice more

**If you did NOT PASS:**
- A red circular arrow icon appears
- "Module Not Passed" in big text
- Your score and the minimum you needed
- A message encouraging you to review the reading above and try again
- A **"Retry Module"** button

**The score is automatically saved!** Whether you passed or failed, your result is saved to the dashboard. If you passed, that module will now show a green "Passed" badge on the dashboard.

### Retrying a Module:

If you didn't pass, click "Retry Module" to try all the scenarios again from the beginning. Your new score will replace the old one in the dashboard.

---

## 7. The Safety Engine Simulator — Testing What-Ifs

The **Safety Engine Simulator** is a really cool tool that lets you test dangerous situations safely — no real lifting machine required! Think of it like a video game where you adjust settings and see if the result is safe or dangerous.

**To get there:** Click "Simulator" in the top menu, or click the "Safety Engine" quick action card on the dashboard.

Web address: `http://localhost:3000/simulator`

### What the Simulator Does:

You enter information about a lift you're about to do — like how heavy the load is, what the ground is like, how windy it is, and how tired the operator is. The simulator then calculates whether the lift is:

- **GO** (green) — Safe to proceed
- **CAUTION** (yellow) — Proceed carefully with specific warnings
- **HARD STOP** (red) — Do NOT lift — a physical danger will stop you
- **BLOCKER** (dark red) — Do NOT lift — a safety protocol is being violated

This is the exact same math the training scenarios use behind the scenes.

### The Two-Panel Layout:

The page is split into **left side** (your inputs) and **right side** (the live verdict).

### LEFT SIDE — The Input Controls:

**Tour Scenario Presets (buttons at the top):**
Six pre-set buttons that fill everything in automatically with realistic concert situations:
- **GO Scenario** — A safe lift situation
- **CAUTION Scenario** — A lift that needs extra care
- **HARD STOP – Wind** — Wind is too fast to lift safely
- **HARD STOP – Overload** — The load is too heavy
- **BLOCKER – Rigging Zone** — The rigging zone isn't clear
- **BLOCKER – STOP Protocol** — The STOP command wasn't echoed properly

Click any of these to quickly see how each danger level looks. This is a great way to learn!

**Load & Environment Section:**

- **Load Weight (lbs)** — Type in how many pounds the thing you're lifting weighs. Slide or type a number.
- **Ground Type** — A dropdown menu. Choose what surface the machine is sitting on:
  - CONCRETE (safest, 100% capacity)
  - ASPHALT (same as concrete)
  - GRAVEL (95% — slightly reduced)
  - FESTIVAL MUD (70% — significantly reduced — common at outdoor festivals!)
  - STAGE DECK (85%)
  - GRASS (80%)
  - DYNAMIC TRUSS (75%)
  - LED WALL (65% — least stable surface)
- **Wind Speed (mph)** — A slider from 0 to 40 mph. The danger zone starts at 15 mph.
- **Boom Angle (degrees)** — How far the boom (the arm) is extended upward, from 0° to 80°
- **Reach (ft)** — How far out horizontally the load is being held, from 0 to 25 feet
- **Lift Height (ft)** — How high the load is being raised

**Fatigue Factors Section:**

- **Time of Day (24hr)** — A slider from 0 (midnight) to 23 (11pm). Late-night hours (11pm–7am) reduce safe capacity because operators make more mistakes when tired
- **Shift Duration (hrs)** — How many hours the operator has already been working. Over 10 hours starts reducing safety; over 12 hours reduces it more

**Communications & Crew Section:**

- **Command word** — What word was spoken to authorize the lift. It MUST be "STOP" (that's the protocol — if it's not exactly the right word, it's a BLOCKER)
- **Pushers near halo zone** — A number field: how many ground crew members are within 3 feet of the load (the "halo zone"). Any number > 0 creates a CAUTION
- **Rigging zone clear** — A toggle (on/off): is the area below any rigging overhead completely clear?
- **STOP echoed** — A toggle: did the operator echo back the "STOP" command? (Required by protocol)
- **Crew on load** — A toggle: is anyone standing on or attached to the load being lifted? (Always a CAUTION)

### RIGHT SIDE — The Live Verdict:

As you change ANY setting on the left, the right panel updates instantly in real time. You don't need to click a "Calculate" button.

**The Verdict Badge:**
A large colored badge at the top showing GO, CAUTION, HARD STOP, or BLOCKER.

**The Reasoning:**
A sentence or two explaining WHY it gave that verdict. For example: "Wind speed 17 mph exceeds the 15 mph threshold. Cease all lift operations."

**Derated Capacity:**
Shows how the maximum safe lifting weight was calculated:
- **Base capacity:** 10,000 lbs (the machine's rated maximum)
- A progress bar showing what percentage of capacity is being used
- Each factor that reduced capacity (ground type, fatigue, reach) is listed with its percentage

**Derating Factors:**
A list of every reduction applied:
- Ground type multiplier (e.g., "Festival Mud × 0.70")
- Fatigue modifier (e.g., "Night shift × 0.95")
- Reach derating (e.g., "20 ft reach × 0.60")

**Falling Object Impact:**
A calculation showing how hard the load would hit the ground if it fell. This is in "lb·ft/s" units. The higher this number, the more dangerous a drop would be.

### How to Use the Simulator:

1. **Start with a preset** — Click "GO Scenario" to see what a safe lift looks like
2. **Change one thing at a time** — Move the wind slider up and watch when it changes from GO to HARD STOP (it's at 15 mph!)
3. **Try all the presets** to see each danger category
4. **Build your own scenarios** — Think of a real situation from a concert and enter the numbers

---

## 8. The Knowledge Base — Your Reference Library

The **Knowledge Base** (also called Resources) is like a dictionary or encyclopedia of everything you've learned. Every named technique, safety rule, and command is listed here, searchable, and can be printed.

**To get there:** Click "Resources" in the top menu, or the "Knowledge Base" quick action card on the dashboard.

Web address: `http://localhost:3000/resources`

### The Quick-Reference Rule Card:

At the top of the page is a big card titled **"Quick-Reference Rule Card"** with a small book-with-bookmark icon. This is meant to be printed and hung on the wall at your workstation.

**It has four sections:**

**Daily Reminders:**
A bullet-point list of the most important things to check and remember every single day before operating any equipment.

**Commands:**
A list of the special words used on the floor and what they mean:
- Each command word is in **bold**
- Followed by its meaning

**Wind Rule (red box):**
The exact rule about wind speed — when you must stop all lifting operations. The threshold is 15 mph.

**Fatigue Rule (yellow box):**
The rule about working too many hours — when operator fatigue makes lifting unsafe.

**Stop-Work Phrases (gray boxes):**
A list of the exact phrases you can say to halt any operation, no argument needed. These are the magic words that protect everyone on the floor. They appear in italics inside small rounded boxes.

**To print the Rule Card:** Click the **"Print Rule Card"** button in the top-right corner of the page. Your browser's print dialog will open, and only the Rule Card will print (the search boxes and other navigation are hidden when printing).

### The Technique Glossary:

Below the Rule Card is the full library of named techniques. Each technique has its own card showing:
- **The technique name** (e.g., "Flush-Fork Rule" or "Up-Look Protocol")
- **A category badge** (what type of technique it is)
- **A summary** — what the technique is and when you use it
- **A rule statement** — the exact rule to follow, shown with an orange left border

**There are 25+ techniques in total.**

### Searching for Techniques:

**Using the search box:**
1. Click inside the search box (it says "Search techniques, rules, keywords…")
2. Start typing any word — like "wind" or "halo" or "STOP"
3. The technique cards instantly filter to show only matching results
4. The count in the top-right updates to show how many results match

**Using category filters:**
Below the search box are small pill-shaped buttons for each category:
- **All** — shows everything
- Other category names like "Ground Operations," "Communications," "Rigging," etc.
- Click a category to filter to only techniques in that group
- The active category button turns orange

**To clear a search:** Delete the text from the search box or click "All" to see everything again.

**Clicking on a technique card** takes you directly to the module where that technique is taught!

---

## 9. The AI Safety Tutor — Your Floating Helper

On every page of the website (except the home page), there is a **floating orange button** in the bottom-right corner of the screen. It looks like a circle with a chat bubble icon inside it.

This is the **AI Safety Tutor** — a conversational assistant you can ask questions anytime.

### Opening the Tutor:

Click the orange circle button in the bottom-right corner. A panel slides up showing:
- A header with a hard hat icon and "AI Safety Tutor"
- The name of the current module you're studying (if you're on a module page)
- Three suggested questions you can click instead of typing

### Suggested Questions:

When you first open the tutor, three ready-made questions appear as clickable buttons:
- "Quiz me on the Up-Look Protocol"
- "Explain Sail Effect derating like I'm new"
- "Give me a 2:00 AM rigging-zone scenario"

**Click any of these** to instantly send that question to the tutor without typing!

### Chatting with the Tutor:

The tutor works like a text messaging conversation:
1. Type your question in the box at the bottom
2. Press Enter or click the send button (arrow icon)
3. The tutor responds with an answer

**The tutor knows:**
- Every module and technique in the curriculum
- Which module you're currently studying (it adjusts its answers to be more relevant)
- The Safety Engine rules
- Real concert/festival production context — it won't give you generic warehouse advice

**Example questions you could ask:**
- "What is the 3-foot halo zone?"
- "When can I lift in festival mud?"
- "Explain the fatigue modifier"
- "What happens if I don't echo STOP?"
- "Quiz me on rigging zone protocol"

### Closing the Tutor:

Click the **X button** in the top-right corner of the tutor panel to close it. The orange circle button stays on screen.

### If the Tutor Says "Needs an API Key":

If you see a message saying the tutor needs an Anthropic API key, that means the AI features haven't been enabled yet. The website still works perfectly — all the training, scenarios, and simulator run completely without the AI tutor. To enable it, someone needs to add the API key to the website's settings file (see the README for instructions).

---

## 10. The Certification Page — Earning Your Badge

The **Certification Page** is where your hard work pays off. When you pass all 9 modules, you earn a digital certificate!

**To get there:** Click "Certificate" in the top menu, or the "View Certificate" button on the dashboard (only visible when certified).

Web address: `http://localhost:3000/certificate`

### Before You're Certified (Locked State):

If you haven't passed all modules yet, the page shows:
- A progress ring showing how many modules you've passed
- A lock icon with "Certificate locked"
- How many modules you've passed and how many remain
- A **"Back to Training Hub"** button

**Below that** is a full list of all modules with:
- The module title
- Your score (e.g., "3/4 correct · pass mark 60%")
- A status badge (Passed/Retry/Not Started)
- Your percentage (green if passed, red if failed)

**Even lower**, if you've failed any scenarios, you'll see a section called **"Recommended Review"** with red cards showing:
- Which **technique** you got wrong (e.g., "Wind Threshold Rule")
- Which **module** it's from
- A right arrow to click that takes you straight back to that module to try again

This helps you focus your studying on exactly what you need to improve!

### After You're Certified (Unlocked State):

Once you pass every single module, the certificate appears automatically!

**The Certificate Name Box:**
At the top, a small input box lets you type or edit your name exactly as you want it to appear on the certificate. (You set this on the dashboard too, but you can change it here.)

**The Certificate Card:**
A beautiful dark card with:
- A decorative grid background and orange glow effects
- "TOUR-READY OPERATOR" in large text across the top
- "CERTIFICATE OF COMPLETION" below that
- A line saying this certifies: **[Your Name]**
- A statement: "has demonstrated proficiency in Concert & Festival Telehandler and Forklift Operations"
- The date the certificate was issued
- Your unique **certificate ID** (looks like "TRO-4821-3957") — this is your verification number
- Your score: total correct scenarios out of total
- Two buttons at the bottom:
  - **"Download PNG"** — saves the certificate as a picture file to your computer
  - **"Print / Save PDF"** — opens your browser's print dialog so you can save it as a PDF or print it on paper

**The Module Progress List:**
Scrolling below the certificate shows the complete list of all modules and your scores, same as the locked state.

---

## 11. Saving, Exporting, and Resetting Progress

Your training progress is saved **automatically** in your web browser every time you complete a scenario or module. You don't have to click "Save." This is called **local storage** — it stays on your computer even if you close the browser.

### Exporting Your Progress (Making a Backup File):

1. Go to the **Training Hub** (dashboard)
2. Click the **"Export"** button (download icon) in the top-right corner
3. A file called `tourready-progress.json` will download to your computer
4. This file contains all your scores, module statuses, operator name, and certificate ID
5. A small green "Progress exported" message will briefly appear to confirm it worked

**When to export:**
- Before switching computers
- Before clearing your browser history (this would delete your progress!)
- As a backup in case something goes wrong
- To share your progress with a trainer or supervisor

### Importing Progress (Loading a Backup File):

1. Go to the **Training Hub** (dashboard)
2. Click the **"Import"** button (upload icon) in the top-right corner
3. A file picker window opens — navigate to and select your `tourready-progress.json` file
4. A small green "Progress imported" message confirms it worked
5. Your progress, scores, and name are all restored

**Important:** Importing replaces your current progress with what's in the file. If you've done work since the export, that newer work will be lost.

### Resetting All Progress:

1. Go to the **Training Hub** (dashboard)
2. Click the **"Reset"** button (circular arrow icon) in the top-right corner
3. A popup appears asking: **"Reset all progress on this device? This cannot be undone."**
4. Click **OK** to confirm (or Cancel to go back)
5. All scores, your name, and your certificate ID are erased
6. A small blue "Progress reset" message appears

**WARNING:** There is NO undo for reset. If you haven't exported your progress first, it is gone forever. The confirmation popup is there to make sure you don't do this by accident!

---

## 12. What the Colors Mean

The website uses a careful color system where each color always means the same thing. Once you learn this, you can quickly understand status at a glance.

| Color | Name | What It Means |
|-------|------|---------------|
| 🟠 **Orange** | Accent / Safety Orange | Action items, buttons, highlights, "pay attention" |
| 🟢 **Green** | GO | Safe · Passed · Correct · Certified |
| 🟡 **Yellow** | CAUTION | Proceed carefully · Warning · In Progress |
| 🔴 **Red** | HARD STOP | Danger · Failed · Cannot lift |
| 🔴 **Dark Red** | BLOCKER | Absolute stop · Protocol violation · Most serious |
| ⚫ **Dark Blue/Black** | Background | The main page background |
| ⬜ **Dark Gray** | Surface | Card and panel backgrounds |
| 🔵 **Muted Gray** | Text/Muted | Less important text, labels, timestamps |

**Status badges on module cards:**

| Badge Color | Status | What It Means |
|-------------|--------|---------------|
| Gray | Not Started | You haven't opened this module yet |
| Yellow/Orange | In Progress | You started but haven't reached the pass mark |
| Green | Passed | You met the pass mark — module complete! |
| Red | Retry | You completed all scenarios but didn't pass |

---

## 13. Helpful Tips

### Getting the Most Out of the Training:

1. **Read the theory BEFORE doing scenarios.** The scenarios test what's in the reading. If you skip the reading, you'll struggle to answer correctly.

2. **Pay attention to HARD RULE callout boxes.** These are the most critical safety rules. Memorize them.

3. **In the scenario trainer, write like you're actually on the job.** Don't write like an essay. Write like you'd actually talk: "I'm calling STOP — wind is above 15 mph" is better than "I would consider stopping the operation."

4. **Use specific technique names** in your answers when you know them. The grader looks for the right keywords related to each named technique.

5. **If you fail a scenario, read the feedback carefully.** The feedback always tells you which technique you needed to use and what the correct answer looks like.

6. **Use the Safety Engine Simulator to experiment.** Change one variable at a time and watch what happens. It's the safest way to "learn by doing."

7. **Print the Quick-Reference Rule Card** from the Resources page and keep it visible when you study. It summarizes all the key rules in one place.

8. **Use the AI Tutor** to ask follow-up questions or get quizzed on things you're unsure about. Ask it to explain something in a different way if the reading was confusing.

9. **Don't rush the Capstone.** It's the hardest module and tests everything from all the other modules. Make sure you've passed all 8 regular modules first.

10. **Your progress saves automatically** — you can close the browser and come back any time and everything will be right where you left it.

### If Something Looks Wrong:

- **Page looks weird or won't load:** Try refreshing the browser (press F5 or Ctrl+R)
- **Progress disappeared:** This can happen if you cleared your browser history or cookies. Use the Import button to restore from a backup file.
- **AI Tutor not responding:** If you see a message about an API key, the AI features need to be set up by whoever runs the website. Everything else still works!
- **Scenarios won't submit:** Make sure you've typed enough of an answer (at least a full sentence). Very short answers are rejected.
- **The website says "Not Found":** You might have typed a URL wrong. Go back to `http://localhost:3000` and navigate from there.

---

## 14. Quick Reference — Page-by-Page Summary

| Page | Web Address | What It's For |
|------|-------------|---------------|
| **Home Page** | `/` | Introduction, overview, get started |
| **Training Hub** | `/dashboard` | See all modules, track progress, your name for certificate |
| **Module Page** | `/modules/[name]` | Read theory + do scenario practice |
| **Safety Engine** | `/simulator` | Test lift conditions with real safety math |
| **Knowledge Base** | `/resources` | Search all techniques + print the Rule Card |
| **Certificate** | `/certificate` | View/download your certificate, see module history |
| **AI Tutor** | Floating button (all pages) | Ask questions anytime |

---

### The 9 Modules at a Glance:

| Module | Topic |
|--------|-------|
| Module 0 | Basic Controls & Startup Sequence |
| Module 1 | Truck Pack Logistics |
| Module 2 | Fork Slot Anatomy & Precision Alignment |
| Module 3 | Ground Crew Choreography |
| Module 4 | Heavy Physics & Derated Capacity |
| Module 5 | Night Chaos & Flash Blindness |
| Module 6 | Rigging Zone Coordination |
| Module 7 | Fatigue & Production Pressure |
| Capstone | Final Assessment (tests everything) |

---

### The Four Verdict Levels:

| Signal | Color | Meaning | Action |
|--------|-------|---------|--------|
| **GO** | Green | All checks passed — safe to lift | Proceed |
| **CAUTION** | Yellow | Minor hazard present | Proceed carefully with specific mitigations |
| **HARD STOP** | Red | Physical danger — wind or overload | Do NOT lift — fix the condition first |
| **BLOCKER** | Dark Red | Protocol violated — rigging zone or STOP protocol | Do NOT lift — resolve the safety procedure issue |

---

*TourReady Operator is a training supplement. It does not replace official OSHA certification or supervised hands-on training with real equipment. Always complete required certifications before operating any lift equipment.*
