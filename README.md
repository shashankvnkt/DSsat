# DS Lab Portal - Data Science Laboratory

A clean, simple, and professional web portal for managing Data Science laboratory experiments, executions, outputs, and tooling references.

---

## 🌟 Key Features

1. **Top Navigation**
   - **Home | Lab Executions | Tools | Profile**
   - Theme toggle (Dark / Light mode) with persistent preference.
   - Live SQLite connection indicator.

2. **Home**
   - Clean, professional landing page.
   - Clear welcome & introductory section.
   - Key statistics (10 experiments, completion count, SQLite persistent storage).
   - Structured curriculum overview cards covering Data Ingestion, Cleaning & Indexing, Visualization & EDA, and Machine Learning.

3. **Lab Executions**
   - Displays all **10 laboratory experiments**:
     1. Importing and Exporting Data in CSV, JSON and Excel Formats
     2. Reading Data from Web APIs and SQL Databases
     3. Data Cleaning, Transformation and Text Processing
     4. Advanced Indexing, Hierarchical Indexing and Data Alignment
     5. Data Visualization with Matplotlib and Seaborn
     6. Exploratory Data Analysis (EDA) & Correlation Analysis
     7. Statistical Inference and Probability Distributions
     8. Predictive Modeling with Linear & Multiple Regression
     9. Supervised Classification with Decision Trees & Logistic Regression
     10. Unsupervised Clustering & Dimensionality Reduction (K-Means & PCA)
   - Experiment number (`EXP 01` - `EXP 10`), title, and short description.
   - Status badge (`Completed`, `In Progress`, `Pending`).
   - File & image output previews with interactive preview modal.
   - **Upload / Edit Output** modal to update execution notes, change status, and upload new output files/charts.

4. **Tools**
   - Dedicated page with heading: **Experiment Tools Used**.
   - Displays all software, libraries, and tools used for every experiment.
   - Shows tool name, category, and concise academic purpose for each tool.
   - Includes a quick-reference faculty matrix for professor grading.

5. **Profile & Edit Profile**
   - Professional student identity card:
     - Profile Photo (with live image preview)
     - Full Name
     - Roll Number
     - Section
     - Branch
     - Assistant Professor / Supervisor
     - GitHub & LinkedIn profile links
     - Technical skills chips
     - Lab progress meter (completed / total experiments with animated progress bar)
   - **Edit Profile** button allowing full editing of all profile fields and photo.
   - Changes are saved directly into the SQLite database (`assets/datasets/student.db`) and persistent browser storage.

6. **Database Integrity**
   - Preserves existing database functionality (the existing `student` table in `student.db` remains untouched).
   - Stores `profile`, `executions`, and `tools` in `student.db`.
   - Dual-persistence support: saves to SQLite via REST API when `server.py` is running, and syncs with browser localStorage.

---

## 🚀 How to Run

### Option 1: One-Click Launch (Recommended)
Double-click `start_portal.bat` or run:
```powershell
python server.py
```
Then open your browser at **[http://localhost:8000](http://localhost:8000)**.

### Option 2: Direct Static Browser Open
Double-click `index.html` to open directly in any browser (`file:///...`). All interactive features, output views, profile edits, and persistent storage work out of the box.

---

## 📂 Project Structure

```text
DS project/
├── index.html                  # Main portal HTML
├── server.py                   # Lightweight Python HTTP + SQLite API server
├── init_db.py                  # Database schema & seed script
├── test_server.py              # Automated test suite
├── start_portal.bat            # One-click launcher script
├── README.md                   # Documentation
└── assets/
    ├── css/
    │   └── styles.css          # Styling & theme variables
    ├── datasets/
    │   ├── student.db          # SQLite database (student, profile, executions, tools)
    │   ├── students.txt        # Lab dataset
    │   ├── iris_output.csv     # Lab output dataset
    │   └── uploads/            # Student uploaded execution artifacts
    ├── img/
    │   ├── student-photo.jpg   # Default student profile photo
    │   └── outputs/            # 10 Experiment SVG/PNG preview charts
    └── js/
        ├── app.js              # Application logic, router, modals & API sync
        └── data.js             # Seed data & fallback structures
```
