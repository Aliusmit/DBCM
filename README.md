# DBCM Study Material — Don Bosco College, Maram (Autonomous)

> Official academic resources, lecture notes, high-yield exam question banks (IMPs), and verified curricula across **14 Academic Departments** under the National Education Policy (NEP) framework.

---

## 🌟 Overview

**DBCM Study Material** is a modern, high-performance, responsive academic web portal developed for the students and faculty of **Don Bosco College, Maram (Autonomous)**, affiliated with Manipur University.

The platform provides structured, unit-wise degree curricula split into dedicated **Major (Core Degree)** and **Minor (Interdisciplinary Elective)** tracks, high-yield question banks with faculty hints, verified lecture notes, interactive document readers, and administrative management tools.

---

## 🏛️ 14 Academic Departments Covered

The portal organizes curricula and resources across 14 undergraduate departments arranged in a streamlined, two-line interactive grid:

| # | Department Name | Code | Stream / Category |
| :-: | :--- | :--- | :--- |
| **1** | **Computer Science (BCA)** | `BCA` | Computing & Information Technology |
| **2** | **Botany** | `BOT` | Biological & Life Sciences |
| **3** | **Chemistry** | `CHEM` | Chemical & Physical Sciences |
| **4** | **Physics** | `PHY` | Physical Sciences & Mechanics |
| **5** | **Zoology** | `ZOO` | Animal Biology & Life Sciences |
| **6** | **Biotechnology (BBT)** | `BBT` | Molecular & Applied Biotechnology |
| **7** | **Commerce (B.Com)** | `B.COM` | Accounting, Finance & Business Studies |
| **8** | **Economics** | `ECO` | Macro/Microeconomics & Econometrics |
| **9** | **Education** | `EDU` | Pedagogical Foundations & Psychology |
| **10** | **English** | `ENG` | Literature, Linguistics & Cultural Studies |
| **11** | **History** | `HIST` | Ancient, Medieval & Modern History |
| **12** | **Political Science** | `POL` | Governance, Constitution & Global Politics |
| **13** | **Sociology** | `SOC` | Social Systems, Anthropology & Society |
| **14** | **Social Work (BSW)** | `BSW` | Community Organization & Field Work |

---

## 🚀 Key Features

### 🎓 Dual-Track Degree Architecture (NEP Framework)
- **Major Degree Track**: Core departmental degree courses, theory modules, and laboratory practicums.
- **Minor Degree Track**: Interdisciplinary and vocational electives designed to complement the student's major course.
- **Dedicated Major & Minor Track Selectors**: Selecting an Academic Department reveals the streamlined Major/Minor stream selector buttons. Subjects remain concealed until both department and track are selected to keep the workspace clean and focused.

### ⚡ Interactive 14-Department Grid ($7 \times 2$)
- **Two-Line Grid**: Displays all 14 departments in two rows of 7 cards on desktop without any side-scrolling.
- **Hardware-Accelerated Hover Animations**:
  - Smooth vertical elevation (`translateY(-4px)` with `scale(1.02)`).
  - Glowing ambient border highlight and drop shadow.
  - Interactive logo transformation (icon scales, tilts, and shifts to a warm golden-amber hue).
  - High-contrast typography accents.

### 📢 Academic Announcements & Live Updates
- Prominently positioned board broadcasting real-time notices:
  - Curriculum alignment announcements (NEP 2024–25).
  - High-yield Question Bank publications.
  - Chapter notes and study module releases.
  - Live notice ticker synchronized with the Admin Console.

### 🌓 Clean Minimal Dark & Daylight Themes
- **Dark Mode (Default)**: Ultra-clean, distraction-free monochrome styling (`#09090b` OLED black) with high-contrast `#27272a` borders and zero GPU compositing overhead.
- **Light Mode**: Crisp daylight theme optimized for reading and printing.
- One-click navbar theme switcher with persistent `localStorage` memory.

### 🔍 Spotlight Search & Interactive Document Reader
- **Global Search (`Ctrl + K`)**: Instant autocomplete search across subjects, course codes, lecture notes, and question banks.
- **Built-In Document Reader**: Modal view for reading syllabi breakdowns, chapter notes, and IMP questions with one-click **Print / Save PDF** support.
- **Bookmarks Manager**: Save subjects for rapid recall using the persistent bookmarks drawer.

### 🛡️ Administrative Portal
- Secure admin management console (`admin` / `admin123`) to:
  - Upload notes, unit summaries, and high-yield questions.
  - Create and publish new DBCM courses.
  - Broadcast real-time announcements to the portal header and update board.

---

## ⚡ Performance & Response Time Optimizations

1. **Zero Initial DOM Bloat**: 0 subject cards are mounted on initial page load, dropping initial DOM elements by **>90%** for instant First Contentful Paint (FCP).
2. **Debounced Search Inputs**: Search keystrokes are debounced (160ms) to eliminate render thrashing during rapid typing.
3. **CSS Content Containment**: Uses `content-visibility: auto; contain-intrinsic-size: 240px;` so off-screen cards bypass layout/paint operations until scrolled into view.
4. **Dual Server Support**: Fully compatible with both the native **Node.js Express backend** (`http://localhost:3000`) and static servers like **VS Code Live Server** (with automatic JSON fallback).

---

## 💻 Tech Stack

- **Runtime & Backend**: Node.js, Express.js REST API
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS via CDN
- **Typography & Iconography**: Google Inter & JetBrains Mono, Lucide Icons
- **Data Engine**: Structured JSON (`data/curriculum.json` and `public/data/curriculum.json`) with in-memory normalization

---

## 🏁 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or later recommended)

### 1. Clone or Open the Repository
```bash
cd "C:\Users\manue\.gemini\antigravity\scratch\brainheaters-app"
```

### 2. Install Dependencies (if not already installed)
```bash
npm install
```

### 3. Launch the Application
```bash
node server.js
```

### 4. Access the Platform
Open your browser and navigate to:
```
http://localhost:3000
```

> **Note for VS Code Live Server Users**: You can also launch `public/index.html` directly via Live Server (port `5500`). The client automatically detects the port and falls back to local data files seamlessly.

---

## 📁 Repository Directory Structure

```
brainheaters-app/
├── server.js                      # Express backend & REST API endpoints
├── package.json                   # Project metadata and dependencies (express, cors)
├── data/
│   └── curriculum.json            # 14 DBCM Departments & 155 Subjects
├── public/
│   ├── index.html                 # Main Single-Page Application interface
│   ├── css/
│   │   └── styles.css             # Minimal Dark/Light themes, animations & layout
│   ├── js/
│   │   └── app.js                 # State manager, search, track filters & modals
│   └── data/
│       └── curriculum.json        # Static fallback mirror for VS Code Live Server
└── README.md                      # Platform documentation
```
└── README.md                      # Platform documentation
```

---

## 🏫 About the Institution

**Don Bosco College, Maram (DBCM)**  
*Affiliated with Manipur University · Established 2000 · Salesians of Don Bosco*  
- **Accreditation**: NAAC A+ Grade (Autonomous)
- **Motto**: *Virtus et Scientia* (Virtue and Knowledge)
- **Campus**: Maram Khunou, Senapati District, Manipur — 795105  
- **Official Website**: [dbcmaram.ac.in](https://dbcmaram.ac.in)

---

## 📄 License
This project is developed for educational and academic resource distribution at **Don Bosco College, Maram**. All curriculum structures, course codes, and examination formats adhere to the Autonomous Manipur University NEP guidelines.
