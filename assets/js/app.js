/**
 * DS Lab Portal - Application Logic & Database Operations
 */
(function () {
  "use strict";

  // App State
  let theme = "dark";
  let profile = null;
  let executions = [];
  let tools = [];
  let toolsMap = []; // Array of { id, title, tools, toolDetails }
  let isDbServerConnected = false;
  let profileMode = "view"; // "view" | "edit"
  let currentEditSection = "profile"; // "profile" | "executions" | "tools" | "database"
  let editSelectedExpId = 1;

  // HTML escaping helper
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Toast Notification
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    toast.innerHTML = `${icon}<span>${esc(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Theme Management
  function initTheme() {
    const saved = localStorage.getItem("ds-theme");
    if (saved) {
      theme = saved;
    } else {
      theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", theme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("ds-theme", theme);
      });
    }
  }

  // Database & Local State Synchronization
  async function initDatabaseState() {
    const defaultData = window.siteData || {};
    
    // Check localStorage cache first
    const cachedProfile = localStorage.getItem("ds_portal_profile");
    const cachedExecutions = localStorage.getItem("ds_portal_executions");

    if (cachedProfile) {
      try { profile = JSON.parse(cachedProfile); } catch (e) { profile = null; }
    }
    if (cachedExecutions) {
      try { executions = JSON.parse(cachedExecutions); } catch (e) { executions = []; }
    }

    if (!profile) {
      profile = Object.assign({}, defaultData.student || {});
    }
    if (!executions || executions.length === 0) {
      executions = (defaultData.experiments || []).map(e => ({
        experiment_id: e.id,
        title: e.title,
        description: e.description,
        status: e.status || "Completed",
        output_text: e.outputText,
        output_filename: e.outputFilename,
        output_image: e.outputImage
      }));
    }

    // Initialize toolsMap
    const cachedTools = localStorage.getItem("ds_portal_tools");
    if (cachedTools) {
      try { toolsMap = JSON.parse(cachedTools); } catch (e) { toolsMap = []; }
    }
    if (!toolsMap || toolsMap.length === 0) {
      toolsMap = (defaultData.experiments || []).map(e => ({
        id: e.id,
        title: e.title,
        tools: e.tools || [],
        toolDetails: e.toolDetails || (e.tools || []).map(t => ({
          name: t,
          category: "Library",
          purpose: "Used in experiment execution."
        }))
      }));
    }

    // Try fetching from backend SQLite API only if running over HTTP/HTTPS
    if (window.location.protocol.startsWith("http")) {
      try {
        const pRes = await fetch("/api/profile");
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (pJson.success && pJson.data) {
            profile = pJson.data;
            isDbServerConnected = true;
            localStorage.setItem("ds_portal_profile", JSON.stringify(profile));
          }
        }
        
        const eRes = await fetch("/api/executions");
        if (eRes.ok) {
          const eJson = await eRes.json();
          if (eJson.success && Array.isArray(eJson.data) && eJson.data.length > 0) {
            executions = eJson.data;
            isDbServerConnected = true;
            localStorage.setItem("ds_portal_executions", JSON.stringify(executions));
          }
        }

        const tRes = await fetch("/api/tools");
        if (tRes.ok) {
          const tJson = await tRes.json();
          if (tJson.success && Array.isArray(tJson.data)) {
            tools = tJson.data;
          }
        }
      } catch (err) {
        // Backend not running, use client-side persistent storage
        isDbServerConnected = false;
      }
    } else {
      isDbServerConnected = false;
    }

    // Update status pill
    const statusText = document.getElementById("db-status-text");
    if (statusText) {
      statusText.textContent = isDbServerConnected ? "SQLite Connected" : "Local Database Active";
    }
  }

  // Save Profile to Database
  async function saveProfile(updatedProfile) {
    profile = Object.assign({}, profile, updatedProfile);
    localStorage.setItem("ds_portal_profile", JSON.stringify(profile));

    if (isDbServerConnected) {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile)
        });
        const resJson = await res.json();
        if (resJson.success) {
          profile = resJson.data;
          localStorage.setItem("ds_portal_profile", JSON.stringify(profile));
        }
      } catch (e) {
        console.warn("Backend update failed, saved to local persistent storage", e);
      }
    }
    showToast("Profile details updated & saved to database!");
  }

  // Save Execution to Database
  async function saveExecution(updatedExp) {
    const idx = executions.findIndex(e => String(e.experiment_id) === String(updatedExp.experiment_id));
    if (idx !== -1) {
      executions[idx] = Object.assign({}, executions[idx], updatedExp);
    } else {
      executions.push(updatedExp);
    }
    localStorage.setItem("ds_portal_executions", JSON.stringify(executions));

    if (isDbServerConnected) {
      try {
        await fetch("/api/executions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedExp)
        });
      } catch (e) {
        console.warn("Backend update failed, saved to local persistent storage", e);
      }
    }
    showToast(`Experiment ${updatedExp.experiment_id} execution updated in database!`);
  }

  // Upload file to Database / Server
  async function uploadOutputFile(file, expId) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        let url = base64Data;
        let filename = file.name;

        if (isDbServerConnected) {
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                data: base64Data,
                experiment_id: expId
              })
            });
            const data = await res.json();
            if (data.success && data.url) {
              url = data.url;
              filename = data.filename;
            }
          } catch (e) {
            console.warn("File upload to server failed, using inline data URL", e);
          }
        }

        resolve({ url, filename });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Route Parser
  function parseRoute() {
    const h = (location.hash || "#/home").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    const name = parts[0] || "home";
    return { name, id: parts[1] };
  }

  // Active Navigation Links
  function updateNavActive(routeName) {
    document.querySelectorAll(".nav a, .bottom-nav a").forEach(a => {
      const target = (a.getAttribute("data-route") || "").toLowerCase();
      const isMatch = target === routeName || 
                     (routeName === "dashboard" && target === "home") ||
                     (routeName === "lab" && target === "executions");
      a.classList.toggle("active", isMatch);
    });
  }

  // Router Dispatcher
  function router() {
    const r = parseRoute();
    const root = document.getElementById("app");
    if (!root) return;

    updateNavActive(r.name);

    switch (r.name) {
      case "home":
      case "dashboard":
        renderHome(root);
        break;
      case "executions":
      case "labs":
        renderExecutions(root);
        break;
      case "tools":
        renderTools(root);
        break;
      case "profile":
      case "student":
        renderProfile(root);
        break;
      case "edit":
      case "editor":
      case "manage":
        renderEditPortal(root, r.id);
        break;
      default:
        renderHome(root);
    }
    window.scrollTo(0, 0);
  }

  // ==========================================
  // VIEW 1: HOME PAGE
  // ==========================================
  function renderHome(root) {
    const completedCount = executions.filter(e => (e.status || "").toLowerCase() === "completed").length;
    const totalCount = executions.length || 10;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    root.innerHTML = `
      <section class="hero">
        <div>
          <span class="eyebrow">Data Science Laboratory</span>
          <h1>Build. Analyse. <span class="grad">Visualise.</span></h1>
          <p style="font-size: 16.5px; line-height: 1.6; margin-top: 12px; color: var(--fg-muted);">
            Welcome to the <strong>DS Lab Portal</strong>. A clean, simple, and professional platform 
            for managing Data Science laboratory experiments, tracking executions, verifying outputs, 
            and reviewing technical tool stacks.
          </p>

          <div class="btn-group" style="margin-top: var(--space-5);">
            <a class="btn primary" href="#/executions">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              View Lab Executions
            </a>
            <a class="btn" href="#/tools">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Experiment Tools
            </a>
            <a class="btn" href="#/profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
              Student Profile
            </a>
          </div>

          <div class="stats" style="margin-top: var(--space-6);">
            <div class="stat">
              <div class="num">${totalCount}</div>
              <div class="lbl">Lab Experiments</div>
            </div>
            <div class="stat">
              <div class="num">${completedCount} / ${totalCount}</div>
              <div class="lbl">Completed (${progressPercent}%)</div>
            </div>
            <div class="stat">
              <div class="num">SQLite</div>
              <div class="lbl">Persistent DB</div>
            </div>
          </div>
        </div>

        <!-- Student Quick Card -->
        <div class="card" style="display:flex; flex-direction:column; gap: var(--space-3); border-color: var(--line-strong);">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="eyebrow" style="margin:0;">Registered Student</span>
            <span class="status-badge status-completed">Active Portal</span>
          </div>

          <div style="display: flex; gap: var(--space-3); align-items: center; margin-top: 6px;">
            <img src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Student Photo" 
                 style="width: 58px; height: 58px; border-radius: 12px; object-fit: cover; border: 1px solid var(--line-strong);"
                 onerror="this.src='assets/img/student-photo.jpg'">
            <div>
              <h3 style="margin: 0; font-size: 18px;">${esc(profile.name || "Sathwik Reddy")}</h3>
              <div class="muted small" style="font-family: var(--font-mono); color: var(--accent-b);">
                ${esc(profile.roll || "22DS102006")} &bull; ${esc(profile.section || "CSE-DS-2")}
              </div>
            </div>
          </div>

          <div class="meta" style="margin-top: 4px;">
            <span class="chip">${esc(profile.branch || "Data Science")}</span>
            <span class="chip">Python 3</span>
            <span class="chip">Pandas &bull; Seaborn</span>
          </div>

          <div style="background: var(--bg-soft); padding: var(--space-3); border-radius: var(--radius-xs); border: 1px solid var(--line); margin-top: 8px;">
            <div style="display:flex; justify-content:space-between; font-size: 12.5px; margin-bottom: 6px;">
              <span class="muted">Lab Progress</span>
              <span style="font-family: var(--font-mono); font-weight: 600; color: var(--success);">${completedCount} of ${totalCount} Done</span>
            </div>
            <div class="progress-bar-bg" style="height: 8px;">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <button class="btn" onclick="window.setProfileMode('view'); location.hash='#/profile';">
              View Profile
            </button>
            <button class="btn primary" onclick="window.setProfileMode('edit'); location.hash='#/profile';">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      <!-- Quick Jump Navigation -->
      <div class="home-section-nav">
        <a href="#home-modules">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Curriculum Modules
        </a>
        <a href="#home-resources">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Lab Resources
        </a>
        <a href="#home-projects">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Applied Projects
        </a>
      </div>

      <!-- ========================================== -->
      <!-- 1. CURRICULUM MODULES SECTION -->
      <!-- ========================================== -->
      <section id="home-modules" style="margin-top: var(--space-6);">
        <div class="section-h">
          <span class="eyebrow">Academic Progression</span>
          <h2>Laboratory Modules</h2>
          <p class="muted">Structured academic syllabus covering the complete lifecycle of Data Science.</p>
        </div>

        <div class="grid-2">
          <!-- Module 1 -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap: var(--space-3);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="num" style="font-family: var(--font-mono); color: var(--accent-b); font-size: 12px; text-transform: uppercase;">
                  Module 01 &bull; Experiments 01 - 02
                </span>
                <span class="status-badge status-completed">Core</span>
              </div>
              <h3 style="margin-top: 8px;">Data Ingestion &amp; SQL Databases</h3>
              <p class="muted small" style="line-height:1.5;">
                Ingest tabular datasets across multiple file formats (CSV, TSV, JSON, Excel). Connect Python scripts 
                to live HTTP REST web APIs and execute relational SQL transactions in SQLite databases.
              </p>
              <div class="meta" style="margin-top: 8px;">
                <span class="sec-pill">CSV / JSON / Excel</span>
                <span class="sec-pill">REST APIs</span>
                <span class="sec-pill">SQLite3</span>
                <span class="sec-pill">Pandas DataFrames</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small" style="font-family: var(--font-mono); font-size: 11.5px;">Covers: Exp 01, Exp 02</span>
              <a href="#/executions" class="btn ghost" style="padding: 4px 10px; font-size: 12.5px;">View Labs &rarr;</a>
            </div>
          </div>

          <!-- Module 2 -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap: var(--space-3);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="num" style="font-family: var(--font-mono); color: var(--accent-b); font-size: 12px; text-transform: uppercase;">
                  Module 02 &bull; Experiments 03 - 04
                </span>
                <span class="status-badge status-completed">Core</span>
              </div>
              <h3 style="margin-top: 8px;">Data Cleaning &amp; Hierarchical Indexing</h3>
              <p class="muted small" style="line-height:1.5;">
                Identify and remediate missing values (<code>dropna</code>, <code>fillna</code>), calculate statistical z-score outliers, 
                tokenize unstructured strings via regex, and reshape MultiIndex series using <code>stack</code>/<code>unstack</code>.
              </p>
              <div class="meta" style="margin-top: 8px;">
                <span class="sec-pill">Null Imputation</span>
                <span class="sec-pill">Outlier Filtering</span>
                <span class="sec-pill">Regex Tokenization</span>
                <span class="sec-pill">MultiIndex Slicing</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small" style="font-family: var(--font-mono); font-size: 11.5px;">Covers: Exp 03, Exp 04</span>
              <a href="#/executions" class="btn ghost" style="padding: 4px 10px; font-size: 12.5px;">View Labs &rarr;</a>
            </div>
          </div>

          <!-- Module 3 -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap: var(--space-3);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="num" style="font-family: var(--font-mono); color: var(--accent-b); font-size: 12px; text-transform: uppercase;">
                  Module 03 &bull; Experiments 05 - 06
                </span>
                <span class="status-badge status-completed">Core</span>
              </div>
              <h3 style="margin-top: 8px;">Exploratory Data Analysis &amp; Visualization</h3>
              <p class="muted small" style="line-height:1.5;">
                Construct descriptive visualizations including line charts, bar plots, KDE histograms, boxplots, 
                and scatter distributions. Compute Pearson correlation coefficients and annotated Seaborn heatmaps.
              </p>
              <div class="meta" style="margin-top: 8px;">
                <span class="sec-pill">Matplotlib Pyplot</span>
                <span class="sec-pill">Seaborn KDE</span>
                <span class="sec-pill">Correlation Heatmaps</span>
                <span class="sec-pill">Descriptive Stats</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small" style="font-family: var(--font-mono); font-size: 11.5px;">Covers: Exp 05, Exp 06</span>
              <a href="#/executions" class="btn ghost" style="padding: 4px 10px; font-size: 12.5px;">View Labs &rarr;</a>
            </div>
          </div>

          <!-- Module 4 -->
          <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap: var(--space-3);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="num" style="font-family: var(--font-mono); color: var(--accent-b); font-size: 12px; text-transform: uppercase;">
                  Module 04 &bull; Experiments 07 - 10
                </span>
                <span class="status-badge status-completed">Advanced</span>
              </div>
              <h3 style="margin-top: 8px;">Statistical Modeling &amp; Machine Learning</h3>
              <p class="muted small" style="line-height:1.5;">
                Theoretical probability distributions, two-sample hypothesis t-tests, Ordinary Least Squares multiple linear regression, 
                Decision Tree classification, and unsupervised K-Means clustering with PCA dimension reduction.
              </p>
              <div class="meta" style="margin-top: 8px;">
                <span class="sec-pill">SciPy Distributions</span>
                <span class="sec-pill">OLS Regression</span>
                <span class="sec-pill">Decision Trees</span>
                <span class="sec-pill">K-Means &bull; PCA</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small" style="font-family: var(--font-mono); font-size: 11.5px;">Covers: Exp 07 - Exp 10</span>
              <a href="#/executions" class="btn ghost" style="padding: 4px 10px; font-size: 12.5px;">View Labs &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 2. LAB RESOURCES & DATASETS SECTION -->
      <!-- ========================================== -->
      <section id="home-resources" style="margin-top: var(--space-7);">
        <div class="section-h">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap: var(--space-3);">
            <div>
              <span class="eyebrow">Academic Artifacts &amp; Datasets</span>
              <h2>Lab Resources</h2>
              <p class="muted">Downloadable datasets, Python cheatsheets, and curriculum reference manuals.</p>
            </div>
            <span class="chip" style="color: var(--accent-b);">6 Verified Resources</span>
          </div>
        </div>

        <div class="grid-3">
          <!-- Resource 1: students.txt -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div class="resource-meta">
                <h4>students.txt</h4>
                <p>Tab-separated local dataset containing student records used in Experiment 1 ingestion.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; flex: 1;" onclick="window.viewResourceModal('students.txt')">
                View Data
              </button>
              <button class="btn" style="padding: 6px 10px; font-size: 12px;" onclick="window.downloadDatasetFile('students.txt')">
                Download
              </button>
            </div>
          </div>

          <!-- Resource 2: iris_output.csv -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon" style="color: #34d399;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div class="resource-meta">
                <h4>iris_output.csv</h4>
                <p>150-record tabular dataset with 4 morphological features used in EDA and clustering.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; flex: 1;" onclick="window.viewResourceModal('iris_output.csv')">
                View CSV
              </button>
              <button class="btn" style="padding: 6px 10px; font-size: 12px;" onclick="window.downloadDatasetFile('iris_output.csv')">
                Download
              </button>
            </div>
          </div>

          <!-- Resource 3: student.db -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon" style="color: #818cf8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <div class="resource-meta">
                <h4>student.db (SQLite)</h4>
                <p>Relational SQLite database preserving the verified student table and portal records.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; flex: 1;" onclick="window.viewResourceModal('student.db')">
                Inspect Schema
              </button>
              <button class="btn" style="padding: 6px 10px; font-size: 12px;" onclick="window.downloadDatasetFile('student.db')">
                Download
              </button>
            </div>
          </div>

          <!-- Resource 4: Pandas & NumPy Cheatsheet -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon" style="color: #fbbf24;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              </div>
              <div class="resource-meta">
                <h4>Pandas &amp; NumPy Cheatsheet</h4>
                <p>High-yield code syntax for DataFrame indexing, groupbys, vector math, and merges.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; width: 100%;" onclick="window.viewResourceModal('cheatsheet')">
                Open Cheatsheet
              </button>
            </div>
          </div>

          <!-- Resource 5: Matplotlib & Seaborn Guide -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon" style="color: #f43f5e;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div class="resource-meta">
                <h4>Matplotlib &amp; Seaborn Guide</h4>
                <p>Figure anatomy, subplots, palette setups, KDE density plots, and export configs.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; width: 100%;" onclick="window.viewResourceModal('visualization')">
                Open Guide
              </button>
            </div>
          </div>

          <!-- Resource 6: Lab Manual & Syllabus -->
          <div class="resource-card">
            <div class="resource-top">
              <div class="resource-icon" style="color: #a855f7;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="resource-meta">
                <h4>Lab Manual (22DS102006)</h4>
                <p>Official curriculum course syllabus, academic milestones, and evaluation guidelines.</p>
              </div>
            </div>
            <div style="display:flex; gap: 6px; margin-top: var(--space-3);">
              <button class="btn ghost" style="padding: 6px 10px; font-size: 12px; width: 100%;" onclick="window.viewResourceModal('syllabus')">
                View Syllabus
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- 3. APPLIED PROJECTS SECTION -->
      <!-- ========================================== -->
      <section id="home-projects" style="margin-top: var(--space-7);">
        <div class="section-h">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap: var(--space-3);">
            <div>
              <span class="eyebrow">Applied Case Studies</span>
              <h2>Data Science Projects</h2>
              <p class="muted">Practical implementation projects built upon the 10 laboratory experiments.</p>
            </div>
            <a href="#/executions" class="btn ghost" style="font-size: 13px;">View Supporting Labs &rarr;</a>
          </div>
        </div>

        <div class="grid-2">
          <!-- Project 1 -->
          <div class="project-card">
            <div class="project-card-header">
              <div>
                <span class="project-badge">Project 01 &bull; Exploratory Analytics</span>
                <h3>Automated EDA &amp; Feature Correlation Pipeline</h3>
              </div>
              <span class="status-badge status-completed">Completed</span>
            </div>
            <p>
              An automated data-profiling engine that accepts arbitrary CSV datasets, audits column null distributions, 
              computes descriptive statistics (skewness, kurtosis), and generates annotated Pearson correlation heatmaps.
            </p>
            <div class="project-metrics">
              <span>Features Analyzed: <strong>4 Numeric Columns</strong></span>
              <span>Strongest Correlation: <strong>r = 0.963</strong></span>
            </div>
            <div class="meta" style="margin-top: 4px;">
              <span class="chip">Python 3</span>
              <span class="chip">Pandas</span>
              <span class="chip">Seaborn Heatmap</span>
              <span class="chip">Matplotlib</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small">Based on: <strong>Experiment 05 &amp; 06</strong></span>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 12px;" onclick="window.viewExpOutput(6)">
                View Heatmap Output
              </button>
            </div>
          </div>

          <!-- Project 2 -->
          <div class="project-card">
            <div class="project-card-header">
              <div>
                <span class="project-badge">Project 02 &bull; Database Systems</span>
                <h3>SQLite Student Records &amp; Web API Sync Engine</h3>
              </div>
              <span class="status-badge status-completed">Completed</span>
            </div>
            <p>
              A lightweight transactional database engine executing ACID-compliant CRUD queries on <code>student.db</code>, 
              integrated with asynchronous HTTP REST API ingestion from remote GitHub repositories.
            </p>
            <div class="project-metrics">
              <span>Transactions: <strong>ACID Compliant</strong></span>
              <span>API Ingestion: <strong>GitHub REST API</strong></span>
            </div>
            <div class="meta" style="margin-top: 4px;">
              <span class="chip">Python 3</span>
              <span class="chip">SQLite3</span>
              <span class="chip">Requests</span>
              <span class="chip">Pandas SQL Engine</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small">Based on: <strong>Experiment 01 &amp; 02</strong></span>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 12px;" onclick="window.viewExpOutput(2)">
                View DB Output
              </button>
            </div>
          </div>

          <!-- Project 3 -->
          <div class="project-card">
            <div class="project-card-header">
              <div>
                <span class="project-badge">Project 03 &bull; Predictive Modeling</span>
                <h3>Predictive Regression &amp; Error Diagnostic Engine</h3>
              </div>
              <span class="status-badge status-completed">Completed</span>
            </div>
            <p>
              Supervised Ordinary Least Squares (OLS) multiple linear regression model trained on multivariate partitions 
              (80/20 train/test split). Includes residual error scatter diagnostics and coefficient significance checks.
            </p>
            <div class="project-metrics">
              <span>Variance Explained: <strong>R² = 0.892</strong></span>
              <span>Mean Squared Error: <strong>MSE = 1.432</strong></span>
            </div>
            <div class="meta" style="margin-top: 4px;">
              <span class="chip">Scikit-learn</span>
              <span class="chip">OLS Regression</span>
              <span class="chip">Train-Test Split</span>
              <span class="chip">Residual Plots</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small">Based on: <strong>Experiment 08</strong></span>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 12px;" onclick="window.viewExpOutput(8)">
                View Regression Fit
              </button>
            </div>
          </div>

          <!-- Project 4 -->
          <div class="project-card">
            <div class="project-card-header">
              <div>
                <span class="project-badge">Project 04 &bull; Unsupervised Learning</span>
                <h3>Customer Segmentation via K-Means &amp; PCA Projection</h3>
              </div>
              <span class="status-badge status-completed">Completed</span>
            </div>
            <p>
              Unsupervised clustering pipeline standardizing continuous input vectors, evaluating Within-Cluster Sum of Squares 
              (WCSS) elbow curves to isolate $k=3$ clusters, and projecting them across 2 principal components.
            </p>
            <div class="project-metrics">
              <span>Optimal Clusters: <strong>k = 3 (Elbow Method)</strong></span>
              <span>Preserved Variance: <strong>87.2% PCA</strong></span>
            </div>
            <div class="meta" style="margin-top: 4px;">
              <span class="chip">Scikit-learn KMeans</span>
              <span class="chip">PCA 2D</span>
              <span class="chip">StandardScaler</span>
              <span class="chip">Silhouette Score: 0.684</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--line); padding-top: var(--space-2); margin-top: 6px;">
              <span class="muted small">Based on: <strong>Experiment 09 &amp; 10</strong></span>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 12px;" onclick="window.viewExpOutput(10)">
                View Cluster Plot
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================
  // VIEW 2: LAB EXECUTIONS PAGE
  // ==========================================
  function renderExecutions(root) {
    const completedCount = executions.filter(e => (e.status || "").toLowerCase() === "completed").length;
    const totalCount = executions.length;

    let itemsHtml = executions.map(exp => {
      const statusClass = (exp.status || "Completed").toLowerCase().replace(/\s+/g, "");
      const numFormatted = String(exp.experiment_id).padStart(2, "0");
      const previewImg = exp.output_image || `assets/img/outputs/exp${exp.experiment_id}-output.svg`;
      const filename = exp.output_filename || `exp${exp.experiment_id}_output.txt`;

      return `
        <div class="exp-execution-card" data-exp-id="${exp.experiment_id}">
          <div class="exp-index">
            <span class="exp-label">EXP</span>
            <span class="exp-num">${numFormatted}</span>
          </div>

          <div class="exp-details">
            <div style="display:flex; align-items:center; gap: 8px; flex-wrap:wrap; margin-bottom: 4px;">
              <h3>${esc(exp.title)}</h3>
              <span class="status-badge status-${statusClass}">${esc(exp.status || "Completed")}</span>
            </div>
            <p>${esc(exp.description)}</p>
          </div>

          <div class="exp-preview-col" onclick="window.viewExpOutput(${exp.experiment_id})" title="Click to view full execution output preview">
            <div class="preview-thumb">
              <img src="${esc(previewImg)}" alt="Exp ${numFormatted} Preview" onerror="this.src='assets/img/outputs/exp1-output.svg'">
            </div>
            <div class="preview-meta">
              <span class="muted" style="font-size:11px;">Output File</span>
              <span class="filename" title="${esc(filename)}">${esc(filename)}</span>
              <span class="action-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Output
              </span>
            </div>
          </div>

          <div class="exp-actions">
            <button class="btn primary" style="padding: 8px 14px; font-size: 13px;" onclick="window.openUploadModal(${exp.experiment_id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Edit Execution
            </button>
          </div>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <div class="section-h">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap: var(--space-3);">
          <div>
            <span class="eyebrow">Laboratory Experiments</span>
            <h2>Lab Executions</h2>
            <p class="muted">All 10 required Data Science experiments with execution statuses, outputs, and artifact previews.</p>
          </div>
          <div style="display:flex; align-items:center; gap: 10px;">
            <span class="status-badge status-completed">${completedCount} / ${totalCount} Executed</span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4);">
        ${itemsHtml}
      </div>
    `;
  }

  // ==========================================
  // VIEW 3: TOOLS PAGE
  // ==========================================
  function renderTools(root) {
    let toolsHtml = toolsMap.map(item => {
      const numFormatted = String(item.id).padStart(2, "0");
      const chips = (item.tools || []).map(t => `<span class="chip">${esc(t)}</span>`).join(" ");
      const rows = (item.toolDetails || []).map(td => `
        <div class="tool-item-row">
          <div class="tool-item-head">
            <span class="tool-name-badge">${esc(td.name)}</span>
            <span class="tool-category-badge">${esc(td.category)}</span>
          </div>
          <div class="tool-purpose-text">${esc(td.purpose)}</div>
        </div>
      `).join("");

      return `
        <div class="tool-exp-card" data-exp="${item.id}">
          <div class="tool-exp-top">
            <span class="num">EXPERIMENT ${numFormatted}</span>
            <div style="display:flex; align-items:center; gap: 8px;">
              <span class="muted small">${(item.tools || []).length} Tools</span>
              <button class="btn ghost" style="padding: 2px 8px; font-size: 11px; min-height: 24px;" onclick="window.openEditToolsForExp(${item.id})" title="Edit tools for this experiment">
                ✏️ Edit
              </button>
            </div>
          </div>
          <h3 style="font-size: 16px; margin: 0;">${esc(item.title)}</h3>
          <div style="display:flex; gap: 4px; flex-wrap:wrap;">
            ${chips}
          </div>
          <div class="tool-item-list" style="margin-top: 4px;">
            ${rows}
          </div>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      <div class="section-h">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: var(--space-3);">
          <div>
            <span class="eyebrow">Technical Stack &amp; Software Environment</span>
            <h2>Experiment Tools Used</h2>
            <p class="muted">
              Detailed technical reference of all languages, libraries, and database software applied in each experiment.
            </p>
          </div>
          <button class="btn primary" onclick="window.openEditToolsForExp(1)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Edit Experiment Tools
          </button>
        </div>
      </div>

      <div class="tools-header-banner">
        <div>
          <h3 style="margin: 0 0 6px;">Data Science Technical Stack</h3>
          <p class="muted small" style="margin: 0;">
            Primary environment: <strong>Python 3.10+</strong> &bull; Package manager: <strong>pip</strong> &bull; Database: <strong>SQLite3</strong>
          </p>
        </div>
        <div style="display:flex; gap: 8px; flex-wrap:wrap;">
          <span class="chip">Python 3</span>
          <span class="chip">Pandas</span>
          <span class="chip">NumPy</span>
          <span class="chip">SQLite3</span>
          <span class="chip">Matplotlib</span>
          <span class="chip">Seaborn</span>
          <span class="chip">Scikit-learn</span>
          <span class="chip">SciPy</span>
        </div>
      </div>

      <div class="tools-grid">
        ${toolsHtml}
      </div>

      <!-- Professor Reference Table -->
      <section style="margin-top: var(--space-7);">
        <div class="section-h">
          <span class="eyebrow">Quick Faculty Reference</span>
          <h3>Tools vs Experiments Matrix</h3>
        </div>
        <div class="card" style="overflow-x: auto; padding: 0;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
            <thead>
              <tr style="background: var(--bg-soft); border-bottom: 1px solid var(--line);">
                <th style="padding: 12px 16px; font-family: var(--font-mono); color: var(--accent-b);">Experiment</th>
                <th style="padding: 12px 16px; font-family: var(--font-mono); color: var(--accent-b);">Title</th>
                <th style="padding: 12px 16px; font-family: var(--font-mono); color: var(--accent-b);">Core Tools &amp; Libraries</th>
                <th style="padding: 12px 16px; font-family: var(--font-mono); color: var(--accent-b);">Core Academic Objective</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 01</td><td style="padding: 10px 16px;">Import/Export Data</td><td style="padding: 10px 16px;"><code>Python, NumPy, Pandas</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Tabular CSV, TSV &amp; JSON file I/O</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 02</td><td style="padding: 10px 16px;">Web APIs &amp; SQL Databases</td><td style="padding: 10px 16px;"><code>Python, Requests, SQLite3, Pandas</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">REST API ingestion and SQLite CRUD transactions</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 03</td><td style="padding: 10px 16px;">Data Cleaning &amp; Text Processing</td><td style="padding: 10px 16px;"><code>Python, Pandas, NumPy, Regex</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Missing values, categorical mapping &amp; outlier filtering</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 04</td><td style="padding: 10px 16px;">Hierarchical MultiIndex</td><td style="padding: 10px 16px;"><code>Python, Pandas, NumPy</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">MultiIndex slicing, reshape stack/unstack</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 05</td><td style="padding: 10px 16px;">Matplotlib &amp; Seaborn Viz</td><td style="padding: 10px 16px;"><code>Python, Matplotlib, Seaborn, Pandas</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Line plots, bar charts, KDE density, box plots</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 06</td><td style="padding: 10px 16px;">EDA &amp; Correlation Analysis</td><td style="padding: 10px 16px;"><code>Python, Pandas, Seaborn, Matplotlib</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Summary stats and annotated correlation heatmap</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 07</td><td style="padding: 10px 16px;">Statistical Inference</td><td style="padding: 10px 16px;"><code>Python, SciPy Stats, NumPy, Matplotlib</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Probability distributions, two-sample t-test</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 08</td><td style="padding: 10px 16px;">Regression Modeling</td><td style="padding: 10px 16px;"><code>Python, Scikit-learn, Pandas, Matplotlib</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">OLS multiple linear regression, R2 evaluation</td></tr>
              <tr style="border-bottom: 1px solid var(--line);"><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 09</td><td style="padding: 10px 16px;">Classification &amp; Decision Trees</td><td style="padding: 10px 16px;"><code>Python, Scikit-learn, Seaborn, Matplotlib</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">Decision tree classifiers &amp; confusion matrix</td></tr>
              <tr><td style="padding: 10px 16px; font-family: var(--font-mono);">Exp 10</td><td style="padding: 10px 16px;">Clustering &amp; PCA</td><td style="padding: 10px 16px;"><code>Python, Scikit-learn, NumPy, Matplotlib</code></td><td style="padding: 10px 16px; color: var(--fg-muted);">K-Means elbow method &amp; PCA dimension reduction</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  // Mode switcher for Profile page
  window.setProfileMode = function (mode) {
    profileMode = mode;
    const r = parseRoute();
    if (r.name !== "profile" && r.name !== "student") {
      location.hash = "#/profile";
    } else {
      const root = document.getElementById("app");
      if (root) renderProfile(root);
    }
  };

  // ==========================================
  // VIEW 4: STUDENT PROFILE PAGE (VIEW & EDIT MODES)
  // ==========================================
  function renderProfile(root) {
    const completedCount = executions.filter(e => (e.status || "").toLowerCase() === "completed").length;
    const totalCount = executions.length || 10;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const skillsArray = (profile.skills || "Python, Pandas, NumPy, SQLite, Matplotlib, Seaborn")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    const skillsChips = skillsArray.map(s => `<span class="skill-tag">${esc(s)}</span>`).join("");

    // Top Header with Mode Switcher
    const headerHtml = `
      <div class="section-h">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: var(--space-3);">
          <div>
            <span class="eyebrow">Academic Identity</span>
            <h2>${profileMode === 'edit' ? 'Edit Student Profile' : 'Student Profile'}</h2>
            <p class="muted">
              ${profileMode === 'edit' 
                ? 'Update your personal, supervisor, and contact information. Changes save permanently to the database.' 
                : 'Verified student credentials, supervisor details, skills, and lab execution progress.'}
            </p>
          </div>

          <!-- Mode Switcher Tabs -->
          <div style="display:flex; background: var(--bg-soft); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--line);">
            <button class="btn ${profileMode === 'view' ? 'primary' : 'ghost'}" 
                    style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                    onclick="window.setProfileMode('view')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
              View Profile
            </button>
            <button class="btn ${profileMode === 'edit' ? 'primary' : 'ghost'}" 
                    style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                    onclick="window.setProfileMode('edit')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Edit Profile Details
            </button>
          </div>
        </div>
      </div>
    `;

    // VIEW MODE CONTENT
    if (profileMode === "view") {
      root.innerHTML = `
        ${headerHtml}

        <div class="profile-container" style="margin-top: var(--space-4);">
          <!-- Student ID Card -->
          <div class="idcard-wrap" style="padding: 0;">
            <div class="idcard">
              <div class="idcard-head">
                <img class="idcard-photo" id="view-idcard-photo" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="${esc(profile.name)} photo" onerror="this.src='assets/img/student-photo.jpg'">
                <div>
                  <p class="idcard-name">${esc(profile.name || "Sathwik Reddy")}</p>
                  <div class="idcard-roll">${esc(profile.roll || "22DS102006")}</div>
                  <div class="muted small" style="color: #9aa6c4; margin-top: 2px;">${esc(profile.section || "CSE-DS-2")}</div>
                </div>
              </div>

              <div class="idcard-body">
                <div class="id-row"><span>Name</span><span>${esc(profile.name)}</span></div>
                <div class="id-row"><span>Roll No</span><span>${esc(profile.roll)}</span></div>
                <div class="id-row"><span>Section</span><span>${esc(profile.section)}</span></div>
                <div class="id-row"><span>Branch</span><span>${esc(profile.branch)}</span></div>
                <div class="id-row"><span>Faculty</span><span>${esc(profile.faculty || profile.facultyName || "Assistant Professor")}</span></div>
              </div>

              <div class="id-card-footer">
                <div class="barcode">${esc(profile.roll)} |||| ||| ||||</div>
                <div class="socials">
                  <a href="${esc(profile.github || '#')}" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub Profile">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 016 0C17 .8 18 1.1 18 1.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0023.5 12C23.5 5.7 18.3.5 12 .5z"/>
                    </svg>
                  </a>
                  <a href="${esc(profile.linkedin || '#')}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn Profile">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.4 3H3.6A.6.6 0 003 3.6v16.8a.6.6 0 00.6.6h16.8a.6.6 0 00.6-.6V3.6a.6.6 0 00-.6-.6zM8.3 18.3H5.7v-7.5h2.6v7.5zM7 9.7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11.3 8.6h-2.6v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 1.9v3.8H10.5v-7.5h2.5v1h0c.3-.6 1.2-1.3 2.5-1.3 2.7 0 3.2 1.8 3.2 4.1v3.7z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <!-- Prominent Edit Profile Button directly on card -->
            <button class="btn primary" style="width: 100%; margin-top: var(--space-3);" onclick="window.setProfileMode('edit')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Edit Profile Details
            </button>
          </div>

          <!-- Academic & Lab Details -->
          <div style="display:flex; flex-direction:column; gap: var(--space-4);">
            <!-- Lab Progress Card -->
            <div class="progress-card">
              <div class="progress-header">
                <div>
                  <h3 style="margin: 0;">Lab Execution Progress</h3>
                  <span class="muted small">Course: 22DS102006 - Data Science Laboratory</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--success);">
                    ${completedCount} / ${totalCount}
                  </span>
                  <div class="muted small">Experiments Completed</div>
                </div>
              </div>

              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>

              <div style="display:flex; justify-content:space-between; font-size: 13px; color: var(--fg-muted);">
                <span>Overall Completion: <strong>${progressPercent}%</strong></span>
                <span>Status: <strong style="color: var(--success);">${progressPercent === 100 ? 'All Completed' : 'In Progress'}</strong></span>
              </div>
            </div>

            <!-- Academic & Supervisor Details Card -->
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin: 0; font-size: 17px;">Curriculum &amp; Supervisor Information</h3>
                <button class="btn ghost" style="padding: 4px 8px; font-size: 12px;" onclick="window.setProfileMode('edit')">
                  ✏️ Edit
                </button>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-top: var(--space-3);">
                <div>
                  <div class="muted small" style="text-transform: uppercase; font-family: var(--font-mono); font-size: 11px;">Department</div>
                  <div style="font-weight: 500; margin-top: 2px;">Department of Data Science</div>
                </div>
                <div>
                  <div class="muted small" style="text-transform: uppercase; font-family: var(--font-mono); font-size: 11px;">Assistant Professor</div>
                  <div style="font-weight: 500; margin-top: 2px;">${esc(profile.faculty || "Dr. K. Ramesh (Assistant Professor)")}</div>
                </div>
                <div>
                  <div class="muted small" style="text-transform: uppercase; font-family: var(--font-mono); font-size: 11px;">Branch</div>
                  <div style="font-weight: 500; margin-top: 2px;">${esc(profile.branch)}</div>
                </div>
                <div>
                  <div class="muted small" style="text-transform: uppercase; font-family: var(--font-mono); font-size: 11px;">Section / Group</div>
                  <div style="font-weight: 500; margin-top: 2px;">${esc(profile.section)}</div>
                </div>
              </div>
            </div>

            <!-- Technical Skills Card -->
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin: 0; font-size: 17px;">Technical Skills &amp; Competencies</h3>
                <button class="btn ghost" style="padding: 4px 8px; font-size: 12px;" onclick="window.setProfileMode('edit')">
                  ✏️ Edit Skills
                </button>
              </div>
              <div class="skills-tags">
                ${skillsChips}
              </div>
            </div>
          </div>
        </div>
      `;
    } 
    // EDIT MODE CONTENT (IN-PAGE EDIT FORM)
    else {
      root.innerHTML = `
        ${headerHtml}

        <div class="profile-container" style="margin-top: var(--space-4);">
          <!-- Live Preview ID Card -->
          <div class="idcard-wrap" style="padding: 0;">
            <div class="muted small" style="text-align:center; margin-bottom: 8px; font-family: var(--font-mono);">
              &#x1F504; Live ID Card Preview
            </div>
            <div class="idcard">
              <div class="idcard-head">
                <img class="idcard-photo" id="inline-preview-photo" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Student Photo" onerror="this.src='assets/img/student-photo.jpg'">
                <div>
                  <p class="idcard-name" id="inline-preview-name">${esc(profile.name || "Sathwik Reddy")}</p>
                  <div class="idcard-roll" id="inline-preview-roll">${esc(profile.roll || "22DS102006")}</div>
                  <div class="muted small" id="inline-preview-section" style="color: #9aa6c4; margin-top: 2px;">${esc(profile.section || "CSE-DS-2")}</div>
                </div>
              </div>

              <div class="idcard-body">
                <div class="id-row"><span>Name</span><span id="preview-row-name">${esc(profile.name)}</span></div>
                <div class="id-row"><span>Roll No</span><span id="preview-row-roll">${esc(profile.roll)}</span></div>
                <div class="id-row"><span>Section</span><span id="preview-row-section">${esc(profile.section)}</span></div>
                <div class="id-row"><span>Branch</span><span id="preview-row-branch">${esc(profile.branch)}</span></div>
                <div class="id-row"><span>Faculty</span><span id="preview-row-faculty">${esc(profile.faculty || profile.facultyName || "Assistant Professor")}</span></div>
              </div>

              <div class="id-card-footer">
                <div class="barcode" id="preview-row-barcode">${esc(profile.roll)} |||| ||| ||||</div>
                <div class="socials">
                  <span style="color: #9aa6c4; font-size: 11px; font-family: var(--font-mono);">Active ID</span>
                </div>
              </div>
            </div>
          </div>

          <!-- In-Page Edit Form -->
          <div class="card" style="border-color: var(--line-strong);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--line); padding-bottom: var(--space-3); margin-bottom: var(--space-4);">
              <h3 style="margin: 0; font-size: 18px;">Edit Profile Fields</h3>
              <span class="chip" style="color: var(--accent-b);">Permanent Storage</span>
            </div>

            <form id="inline-edit-profile-form" onsubmit="window.handleInlineSaveProfile(event)">
              <!-- Photo Upload & URL -->
              <div class="form-group">
                <label>Profile Photo</label>
                <div style="display: flex; gap: var(--space-3); align-items: center; margin-bottom: 6px;">
                  <img id="form-photo-thumbnail" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Preview" 
                       style="width: 58px; height: 58px; border-radius: 10px; object-fit: cover; border: 1px solid var(--line-strong);">
                  <div style="flex: 1;">
                    <input type="file" id="inline-photo-file" accept="image/*" class="form-input" style="padding: 6px 10px; font-size: 12.5px;" onchange="window.previewInlinePhoto(this)">
                    <div class="muted small" style="margin-top: 3px; font-size: 11.5px;">Choose local image file or enter URL below</div>
                  </div>
                </div>
                <input type="text" id="inline-edit-photo" class="form-input" value="${esc(profile.photo || '')}" 
                       placeholder="Image URL (e.g. assets/img/student-photo.jpg)" oninput="window.updateLivePreview()">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="inline-edit-name" class="form-input" value="${esc(profile.name || '')}" required oninput="window.updateLivePreview()">
                </div>
                <div class="form-group">
                  <label>Roll Number</label>
                  <input type="text" id="inline-edit-roll" class="form-input" value="${esc(profile.roll || '')}" required oninput="window.updateLivePreview()">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Section</label>
                  <input type="text" id="inline-edit-section" class="form-input" value="${esc(profile.section || '')}" required oninput="window.updateLivePreview()">
                </div>
                <div class="form-group">
                  <label>Branch / Degree</label>
                  <input type="text" id="inline-edit-branch" class="form-input" value="${esc(profile.branch || '')}" required oninput="window.updateLivePreview()">
                </div>
              </div>

              <div class="form-group">
                <label>Assistant Professor / Faculty Supervisor</label>
                <input type="text" id="inline-edit-faculty" class="form-input" value="${esc(profile.faculty || profile.facultyName || '')}" required oninput="window.updateLivePreview()">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>GitHub Profile URL</label>
                  <input type="url" id="inline-edit-github" class="form-input" value="${esc(profile.github || '')}" placeholder="https://github.com/username">
                </div>
                <div class="form-group">
                  <label>LinkedIn Profile URL</label>
                  <input type="url" id="inline-edit-linkedin" class="form-input" value="${esc(profile.linkedin || '')}" placeholder="https://linkedin.com/in/username">
                </div>
              </div>

              <div class="form-group">
                <label>Technical Skills (Comma-separated)</label>
                <textarea id="inline-edit-skills" class="form-textarea" rows="2" placeholder="Python, Pandas, NumPy, SQLite, Matplotlib...">${esc(profile.skills || '')}</textarea>
              </div>

              <div style="display:flex; justify-content:flex-end; gap: var(--space-3); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-4);">
                <button type="button" class="btn" onclick="window.setProfileMode('view')">
                  Cancel
                </button>
                <button type="submit" class="btn primary" id="inline-save-profile-btn" style="min-width: 180px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
    }
  }

  // Live preview update while user types in Edit Mode
  window.updateLivePreview = function () {
    const nameVal = (document.getElementById("inline-edit-name") || {}).value || "";
    const rollVal = (document.getElementById("inline-edit-roll") || {}).value || "";
    const secVal = (document.getElementById("inline-edit-section") || {}).value || "";
    const branchVal = (document.getElementById("inline-edit-branch") || {}).value || "";
    const facVal = (document.getElementById("inline-edit-faculty") || {}).value || "";
    const photoVal = (document.getElementById("inline-edit-photo") || {}).value || "";

    const nameEl = document.getElementById("inline-preview-name");
    if (nameEl) nameEl.textContent = nameVal;
    const rollEl = document.getElementById("inline-preview-roll");
    if (rollEl) rollEl.textContent = rollVal;
    const secEl = document.getElementById("inline-preview-section");
    if (secEl) secEl.textContent = secVal;

    const rName = document.getElementById("preview-row-name");
    if (rName) rName.textContent = nameVal;
    const rRoll = document.getElementById("preview-row-roll");
    if (rRoll) rRoll.textContent = rollVal;
    const rSec = document.getElementById("preview-row-section");
    if (rSec) rSec.textContent = secVal;
    const rBranch = document.getElementById("preview-row-branch");
    if (rBranch) rBranch.textContent = branchVal;
    const rFac = document.getElementById("preview-row-faculty");
    if (rFac) rFac.textContent = facVal;
    const rBarcode = document.getElementById("preview-row-barcode");
    if (rBarcode) rBarcode.textContent = `${rollVal} |||| ||| ||||`;

    if (photoVal) {
      const pImg = document.getElementById("inline-preview-photo");
      if (pImg) pImg.src = photoVal;
      const fThumb = document.getElementById("form-photo-thumbnail");
      if (fThumb) fThumb.src = photoVal;
    }
  };

  // Preview local photo file in inline edit form
  window.previewInlinePhoto = function (input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const photoUrl = e.target.result;
        const photoInput = document.getElementById("inline-edit-photo");
        if (photoInput) photoInput.value = photoUrl;
        const pImg = document.getElementById("inline-preview-photo");
        if (pImg) pImg.src = photoUrl;
        const fThumb = document.getElementById("form-photo-thumbnail");
        if (fThumb) fThumb.src = photoUrl;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Handle inline form save
  window.handleInlineSaveProfile = async function (e) {
    e.preventDefault();
    const btn = document.getElementById("inline-save-profile-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Saving to Database...";
    }

    const updated = {
      name: document.getElementById("inline-edit-name").value.trim(),
      roll: document.getElementById("inline-edit-roll").value.trim(),
      section: document.getElementById("inline-edit-section").value.trim(),
      branch: document.getElementById("inline-edit-branch").value.trim(),
      faculty: document.getElementById("inline-edit-faculty").value.trim(),
      github: document.getElementById("inline-edit-github").value.trim(),
      linkedin: document.getElementById("inline-edit-linkedin").value.trim(),
      skills: document.getElementById("inline-edit-skills").value.trim(),
      photo: document.getElementById("inline-edit-photo").value.trim()
    };

    await saveProfile(updated);
    profileMode = "view";
    const root = document.getElementById("app");
    if (root) renderProfile(root);
  };

  // ==========================================
  // VIEW 5: DEDICATED PORTAL EDIT OPTIONS PAGE
  // ==========================================
  window.switchEditSection = function (sec) {
    currentEditSection = sec;
    const root = document.getElementById("app");
    if (root) renderEditPortal(root);
  };

  window.openEditToolsForExp = function (expId) {
    currentEditSection = "tools";
    editSelectedExpId = parseInt(expId, 10) || 1;
    location.hash = "#/edit";
  };

  window.openEditExpForExp = function (expId) {
    currentEditSection = "executions";
    editSelectedExpId = parseInt(expId, 10) || 1;
    location.hash = "#/edit";
  };

  window.selectExpToEdit = function (expId) {
    editSelectedExpId = parseInt(expId, 10) || 1;
    const root = document.getElementById("app");
    if (root) renderEditPortal(root);
  };

  function renderEditPortal(root, subtab) {
    if (subtab && ["profile", "executions", "tools", "database"].includes(subtab)) {
      currentEditSection = subtab;
    }

    const currentExp = executions.find(e => String(e.experiment_id) === String(editSelectedExpId)) || executions[0] || {};
    const currentToolExp = toolsMap.find(t => String(t.id) === String(editSelectedExpId)) || toolsMap[0] || { tools: [], toolDetails: [] };

    // Experiment selector options (1 to 10)
    const expOptions = executions.map(e => `
      <option value="${e.experiment_id}" ${String(e.experiment_id) === String(editSelectedExpId) ? 'selected' : ''}>
        Exp ${String(e.experiment_id).padStart(2, '0')}: ${esc(e.title.slice(0, 48))}${e.title.length > 48 ? '...' : ''}
      </option>
    `).join("");

    root.innerHTML = `
      <div class="section-h">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap: var(--space-3);">
          <div>
            <span class="eyebrow">Portal Management &amp; Configuration</span>
            <h2>Edit Options</h2>
            <p class="muted">
              Directly edit and customize your student profile, lab experiment details, output charts, and technical tools. 
              All changes are saved permanently to the database.
            </p>
          </div>
          <div style="display:flex; gap: 8px;">
            <button class="btn ghost" onclick="window.exportDatabaseJson()" title="Download JSON Database Backup">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export DB
            </button>
            <button class="btn danger" onclick="window.resetDatabaseDefaults()" title="Reset to Defaults">
              Reset Defaults
            </button>
          </div>
        </div>

        <!-- Section Navigation Pills -->
        <div style="display:flex; gap: 8px; margin-top: var(--space-4); flex-wrap: wrap; background: var(--bg-soft); padding: 6px; border-radius: var(--radius-sm); border: 1px solid var(--line);">
          <button class="btn ${currentEditSection === 'profile' ? 'primary' : 'ghost'}" 
                  style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                  onclick="window.switchEditSection('profile')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
            Edit Profile
          </button>
          <button class="btn ${currentEditSection === 'executions' ? 'primary' : 'ghost'}" 
                  style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                  onclick="window.switchEditSection('executions')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            Edit Lab Executions (10)
          </button>
          <button class="btn ${currentEditSection === 'tools' ? 'primary' : 'ghost'}" 
                  style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                  onclick="window.switchEditSection('tools')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Edit Experiment Tools
          </button>
          <button class="btn ${currentEditSection === 'database' ? 'primary' : 'ghost'}" 
                  style="min-height: 38px; padding: 6px 14px; font-size: 13px;" 
                  onclick="window.switchEditSection('database')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7"/><path d="M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4"/><path d="M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4"/>
            </svg>
            Database Storage
          </button>
        </div>
      </div>

      <div style="margin-top: var(--space-4);">
        <!-- TAB 1: EDIT PROFILE -->
        ${currentEditSection === 'profile' ? `
          <div class="profile-container">
            <!-- Left: Live Preview ID Card -->
            <div class="idcard-wrap" style="padding: 0;">
              <div class="muted small" style="text-align:center; margin-bottom: 8px; font-family: var(--font-mono);">
                &#x1F504; Live ID Card Preview
              </div>
              <div class="idcard">
                <div class="idcard-head">
                  <img class="idcard-photo" id="inline-preview-photo" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Student Photo" onerror="this.src='assets/img/student-photo.jpg'">
                  <div>
                    <p class="idcard-name" id="inline-preview-name">${esc(profile.name || "Sathwik Reddy")}</p>
                    <div class="idcard-roll" id="inline-preview-roll">${esc(profile.roll || "22DS102006")}</div>
                    <div class="muted small" id="inline-preview-section" style="color: #9aa6c4; margin-top: 2px;">${esc(profile.section || "CSE-DS-2")}</div>
                  </div>
                </div>

                <div class="idcard-body">
                  <div class="id-row"><span>Name</span><span id="preview-row-name">${esc(profile.name)}</span></div>
                  <div class="id-row"><span>Roll No</span><span id="preview-row-roll">${esc(profile.roll)}</span></div>
                  <div class="id-row"><span>Section</span><span id="preview-row-section">${esc(profile.section)}</span></div>
                  <div class="id-row"><span>Branch</span><span id="preview-row-branch">${esc(profile.branch)}</span></div>
                  <div class="id-row"><span>Faculty</span><span id="preview-row-faculty">${esc(profile.faculty || profile.facultyName || "Assistant Professor")}</span></div>
                </div>

                <div class="id-card-footer">
                  <div class="barcode" id="preview-row-barcode">${esc(profile.roll)} |||| ||| ||||</div>
                  <div class="socials">
                    <span style="color: #9aa6c4; font-size: 11px; font-family: var(--font-mono);">Active ID</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Edit Profile Form -->
            <div class="card" style="border-color: var(--line-strong);">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--line); padding-bottom: var(--space-3); margin-bottom: var(--space-4);">
                <h3 style="margin: 0; font-size: 18px;">Edit Student Profile Details</h3>
                <span class="chip" style="color: var(--accent-b);">Persistent Storage</span>
              </div>

              <form id="portal-edit-profile-form" onsubmit="window.handlePortalSaveProfile(event)">
                <!-- Photo Upload & URL -->
                <div class="form-group">
                  <label>Profile Photo</label>
                  <div style="display: flex; gap: var(--space-3); align-items: center; margin-bottom: 6px;">
                    <img id="form-photo-thumbnail" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Preview" 
                         style="width: 58px; height: 58px; border-radius: 10px; object-fit: cover; border: 1px solid var(--line-strong);">
                    <div style="flex: 1;">
                      <input type="file" id="portal-photo-file" accept="image/*" class="form-input" style="padding: 6px 10px; font-size: 12.5px;" onchange="window.previewInlinePhoto(this)">
                      <div class="muted small" style="margin-top: 3px; font-size: 11.5px;">Choose local image file or enter URL below</div>
                    </div>
                  </div>
                  <input type="text" id="inline-edit-photo" class="form-input" value="${esc(profile.photo || '')}" 
                         placeholder="Image URL (e.g. assets/img/student-photo.jpg)" oninput="window.updateLivePreview()">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="inline-edit-name" class="form-input" value="${esc(profile.name || '')}" required oninput="window.updateLivePreview()">
                  </div>
                  <div class="form-group">
                    <label>Roll Number</label>
                    <input type="text" id="inline-edit-roll" class="form-input" value="${esc(profile.roll || '')}" required oninput="window.updateLivePreview()">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Section</label>
                    <input type="text" id="inline-edit-section" class="form-input" value="${esc(profile.section || '')}" required oninput="window.updateLivePreview()">
                  </div>
                  <div class="form-group">
                    <label>Branch / Degree</label>
                    <input type="text" id="inline-edit-branch" class="form-input" value="${esc(profile.branch || '')}" required oninput="window.updateLivePreview()">
                  </div>
                </div>

                <div class="form-group">
                  <label>Assistant Professor / Faculty Supervisor</label>
                  <input type="text" id="inline-edit-faculty" class="form-input" value="${esc(profile.faculty || profile.facultyName || '')}" required oninput="window.updateLivePreview()">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>GitHub Profile URL</label>
                    <input type="url" id="inline-edit-github" class="form-input" value="${esc(profile.github || '')}" placeholder="https://github.com/username">
                  </div>
                  <div class="form-group">
                    <label>LinkedIn Profile URL</label>
                    <input type="url" id="inline-edit-linkedin" class="form-input" value="${esc(profile.linkedin || '')}" placeholder="https://linkedin.com/in/username">
                  </div>
                </div>

                <div class="form-group">
                  <label>Technical Skills (Comma-separated)</label>
                  <textarea id="inline-edit-skills" class="form-textarea" rows="2" placeholder="Python, Pandas, NumPy, SQLite, Matplotlib...">${esc(profile.skills || '')}</textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap: var(--space-3); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-4);">
                  <button type="submit" class="btn primary" id="portal-save-profile-btn" style="min-width: 180px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Profile to Database
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : ''}

        <!-- TAB 2: EDIT LAB EXECUTIONS -->
        ${currentEditSection === 'executions' ? `
          <div class="card" style="border-color: var(--line-strong);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: var(--space-3); border-bottom: 1px solid var(--line); padding-bottom: var(--space-3); margin-bottom: var(--space-4);">
              <div>
                <h3 style="margin: 0; font-size: 18px;">Edit Experiment Details &amp; Outputs</h3>
                <div class="muted small">Select an experiment to modify its title, status, output chart, and terminal notes.</div>
              </div>
              <div style="display:flex; align-items:center; gap: 8px;">
                <label class="muted small" style="text-transform: uppercase; font-family: var(--font-mono);">Experiment:</label>
                <select class="form-select" style="min-width: 220px;" onchange="window.selectExpToEdit(this.value)">
                  ${expOptions}
                </select>
              </div>
            </div>

            <form id="portal-exp-form" onsubmit="window.handleSaveExperimentInPortal(event)">
              <div class="form-row">
                <div class="form-group">
                  <label>Experiment Title</label>
                  <input type="text" id="portal-edit-exp-title" class="form-input" value="${esc(currentExp.title || '')}" required>
                </div>
                <div class="form-group">
                  <label>Execution Status</label>
                  <select id="portal-edit-exp-status" class="form-select">
                    <option value="Completed" ${currentExp.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="In Progress" ${currentExp.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Pending" ${currentExp.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Description &amp; Objective</label>
                <textarea id="portal-edit-exp-desc" class="form-textarea" rows="2" required>${esc(currentExp.description || '')}</textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Output Filename</label>
                  <input type="text" id="portal-edit-exp-filename" class="form-input" value="${esc(currentExp.output_filename || `exp${currentExp.experiment_id}_output.txt`)}">
                </div>
                <div class="form-group">
                  <label>Upload Output Image / File</label>
                  <input type="file" id="portal-edit-exp-file" accept="image/*,.txt,.csv,.json" class="form-input" style="padding: 7px 10px;" onchange="window.previewUploadedOutput(this)">
                </div>
              </div>

              <!-- Output Chart Preview -->
              <div class="form-group">
                <label>Output Chart / Graphic Preview</label>
                <div class="upload-preview-area" id="modal-upload-preview" style="max-height: 240px; background: #070b14; padding: 8px;">
                  <img src="${esc(currentExp.output_image || `assets/img/outputs/exp${currentExp.experiment_id}-output.svg`)}" alt="Output Preview" onerror="this.src='assets/img/outputs/exp1-output.svg'">
                </div>
                <input type="hidden" id="portal-edit-exp-image-url" value="${esc(currentExp.output_image || `assets/img/outputs/exp${currentExp.experiment_id}-output.svg`)}">
              </div>

              <div class="form-group">
                <label>Execution Output &amp; Terminal Logs</label>
                <textarea id="portal-edit-exp-text" class="form-textarea" rows="5" style="font-family: var(--font-mono); font-size: 13px;">${esc(currentExp.output_text || '')}</textarea>
              </div>

              <div style="display:flex; justify-content:flex-end; gap: var(--space-3); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-4);">
                <button type="submit" class="btn primary" id="portal-save-exp-btn" style="min-width: 220px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Experiment to Database
                </button>
              </div>
            </form>
          </div>
        ` : ''}

        <!-- TAB 3: EDIT EXPERIMENT TOOLS -->
        ${currentEditSection === 'tools' ? `
          <div class="card" style="border-color: var(--line-strong);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: var(--space-3); border-bottom: 1px solid var(--line); padding-bottom: var(--space-3); margin-bottom: var(--space-4);">
              <div>
                <h3 style="margin: 0; font-size: 18px;">Edit Tools for Experiment ${editSelectedExpId}</h3>
                <div class="muted small">${esc(currentToolExp.title || '')}</div>
              </div>
              <div style="display:flex; align-items:center; gap: 8px;">
                <label class="muted small" style="text-transform: uppercase; font-family: var(--font-mono);">Experiment:</label>
                <select class="form-select" style="min-width: 220px;" onchange="window.selectExpToEdit(this.value)">
                  ${expOptions}
                </select>
              </div>
            </div>

            <form id="portal-tools-form" onsubmit="window.handleSaveToolsInPortal(event)">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: 600;">Tools &amp; Libraries Used:</span>
                <button type="button" class="btn" style="padding: 6px 12px; font-size: 12.5px;" onclick="window.addToolRowInPortal()">
                  + Add Another Tool
                </button>
              </div>

              <div id="tools-edit-container">
                ${(currentToolExp.toolDetails || []).map((t, idx) => `
                  <div class="tool-edit-row card" style="margin-bottom: 10px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 8px; align-items: start;">
                    <div>
                      <label class="muted small" style="display:block; margin-bottom:2px;">Tool Name</label>
                      <input type="text" class="form-input tool-name-input" value="${esc(t.name)}" placeholder="e.g. Pandas" required>
                    </div>
                    <div>
                      <label class="muted small" style="display:block; margin-bottom:2px;">Category</label>
                      <input type="text" class="form-input tool-cat-input" value="${esc(t.category)}" placeholder="e.g. Data Wrangling">
                    </div>
                    <div>
                      <label class="muted small" style="display:block; margin-bottom:2px;">Purpose</label>
                      <textarea class="form-textarea tool-pur-input" rows="2" placeholder="Short description of purpose...">${esc(t.purpose)}</textarea>
                    </div>
                    <div style="padding-top: 18px;">
                      <button type="button" class="btn danger" style="padding: 6px 10px; font-size: 12px;" onclick="this.closest('.tool-edit-row').remove()" title="Remove tool">
                        &times; Remove
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>

              <div style="display:flex; justify-content:flex-end; gap: var(--space-3); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-4);">
                <button type="submit" class="btn primary" id="portal-save-tools-btn" style="min-width: 200px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Tools to Database
                </button>
              </div>
            </form>
          </div>
        ` : ''}

        <!-- TAB 4: DATABASE STORAGE MANAGEMENT -->
        ${currentEditSection === 'database' ? `
          <div class="card" style="border-color: var(--line-strong);">
            <div style="border-bottom: 1px solid var(--line); padding-bottom: var(--space-3); margin-bottom: var(--space-4);">
              <h3 style="margin: 0; font-size: 18px;">Database &amp; Persistent Storage</h3>
              <div class="muted small">Direct control over SQLite database synchronization, backups, and resets.</div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div class="card" style="background: var(--bg-soft);">
                <span class="eyebrow">Database Status</span>
                <div style="display:flex; align-items:center; gap: 8px; margin-top: 6px;">
                  <span class="db-dot"></span>
                  <strong style="font-size: 16px;">${isDbServerConnected ? 'SQLite Server Connected' : 'Browser Persistent Storage Active'}</strong>
                </div>
                <p class="muted small" style="margin-top: 8px;">
                  All changes made in the Edit Portal (Profile, Experiments, and Tools) are immediately saved to disk / localStorage 
                  and persist across page refreshes and re-logins.
                </p>
              </div>

              <div class="card" style="background: var(--bg-soft);">
                <span class="eyebrow">Data Records Summary</span>
                <div style="margin-top: 6px; display:flex; flex-direction:column; gap: 6px; font-size: 13.5px;">
                  <div>&bull; Student Profile: <strong>${esc(profile.name)}</strong> (${esc(profile.roll)})</div>
                  <div>&bull; Lab Experiments: <strong>${executions.length} Records</strong></div>
                  <div>&bull; Tool Configurations: <strong>${toolsMap.length} Sets</strong></div>
                  <div>&bull; Original SQLite Table <code>student</code>: <strong>Preserved &bull; [(2, 'Joy')]</strong></div>
                </div>
              </div>
            </div>

            <div style="display:flex; gap: var(--space-3); margin-top: var(--space-5); flex-wrap: wrap;">
              <button class="btn primary" onclick="window.exportDatabaseJson()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Complete JSON Backup
              </button>
              <button class="btn danger" onclick="window.resetDatabaseDefaults()">
                Reset All Records to Defaults
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Handle saving profile from Edit Portal
  window.handlePortalSaveProfile = async function (e) {
    e.preventDefault();
    const btn = document.getElementById("portal-save-profile-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Saving to Database...";
    }

    const updated = {
      name: document.getElementById("inline-edit-name").value.trim(),
      roll: document.getElementById("inline-edit-roll").value.trim(),
      section: document.getElementById("inline-edit-section").value.trim(),
      branch: document.getElementById("inline-edit-branch").value.trim(),
      faculty: document.getElementById("inline-edit-faculty").value.trim(),
      github: document.getElementById("inline-edit-github").value.trim(),
      linkedin: document.getElementById("inline-edit-linkedin").value.trim(),
      skills: document.getElementById("inline-edit-skills").value.trim(),
      photo: document.getElementById("inline-edit-photo").value.trim()
    };

    await saveProfile(updated);
    showToast("Profile details updated & saved to database!");
    const root = document.getElementById("app");
    if (root) renderEditPortal(root);
  };

  // Handle saving experiment from Edit Portal
  window.handleSaveExperimentInPortal = async function (e) {
    e.preventDefault();
    const btn = document.getElementById("portal-save-exp-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Saving to Database...";
    }

    let outputImageUrl = document.getElementById("portal-edit-exp-image-url").value;
    let outputFilename = document.getElementById("portal-edit-exp-filename").value.trim();

    if (pendingUploadedFile) {
      try {
        const uploaded = await uploadOutputFile(pendingUploadedFile, editSelectedExpId);
        outputImageUrl = uploaded.url;
        outputFilename = uploaded.filename;
      } catch (err) {
        console.warn(err);
      }
      pendingUploadedFile = null;
    }

    const updated = {
      experiment_id: editSelectedExpId,
      title: document.getElementById("portal-edit-exp-title").value.trim(),
      description: document.getElementById("portal-edit-exp-desc").value.trim(),
      status: document.getElementById("portal-edit-exp-status").value,
      output_filename: outputFilename,
      output_image: outputImageUrl,
      output_text: document.getElementById("portal-edit-exp-text").value
    };

    await saveExecution(updated);
    showToast(`Experiment ${editSelectedExpId} saved to database!`);
    const root = document.getElementById("app");
    if (root) renderEditPortal(root);
  };

  // Handle saving tools from Edit Portal
  window.handleSaveToolsInPortal = function (e) {
    e.preventDefault();
    const rows = document.querySelectorAll("#tools-edit-container .tool-edit-row");
    const updatedDetails = [];
    const updatedToolsList = [];

    rows.forEach(r => {
      const name = (r.querySelector(".tool-name-input") || {}).value.trim();
      const cat = (r.querySelector(".tool-cat-input") || {}).value.trim();
      const pur = (r.querySelector(".tool-pur-input") || {}).value.trim();
      if (name) {
        updatedToolsList.push(name);
        updatedDetails.push({ name, category: cat || "Library", purpose: pur || "Used in lab execution." });
      }
    });

    const expIdx = toolsMap.findIndex(t => String(t.id) === String(editSelectedExpId));
    if (expIdx !== -1) {
      toolsMap[expIdx].tools = updatedToolsList;
      toolsMap[expIdx].toolDetails = updatedDetails;
      localStorage.setItem("ds_portal_tools", JSON.stringify(toolsMap));
      showToast(`Tools for Experiment ${editSelectedExpId} saved to database!`);
      const root = document.getElementById("app");
      if (root) renderEditPortal(root);
    }
  };

  // Add new tool row in Edit Portal
  window.addToolRowInPortal = function () {
    const container = document.getElementById("tools-edit-container");
    if (!container) return;
    const row = document.createElement("div");
    row.className = "tool-edit-row card";
    row.style.cssText = "margin-bottom: 10px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 8px; align-items: start;";
    row.innerHTML = `
      <div>
        <label class="muted small" style="display:block; margin-bottom:2px;">Tool Name</label>
        <input type="text" class="form-input tool-name-input" placeholder="e.g. Pandas" required>
      </div>
      <div>
        <label class="muted small" style="display:block; margin-bottom:2px;">Category</label>
        <input type="text" class="form-input tool-cat-input" placeholder="e.g. Data Wrangling">
      </div>
      <div>
        <label class="muted small" style="display:block; margin-bottom:2px;">Purpose</label>
        <textarea class="form-textarea tool-pur-input" rows="2" placeholder="Short description of purpose..."></textarea>
      </div>
      <div style="padding-top: 18px;">
        <button type="button" class="btn danger" style="padding: 6px 10px; font-size: 12px;" onclick="this.closest('.tool-edit-row').remove()" title="Remove tool">
          &times; Remove
        </button>
      </div>
    `;
    container.appendChild(row);
  };

  // Export JSON Backup
  window.exportDatabaseJson = function () {
    const data = {
      profile: profile,
      executions: executions,
      tools: toolsMap,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ds_lab_portal_database_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Database backup JSON downloaded!");
  };

  // Reset to defaults
  window.resetDatabaseDefaults = function () {
    if (confirm("Are you sure you want to reset all portal details and experiments to original lab defaults?")) {
      localStorage.removeItem("ds_portal_profile");
      localStorage.removeItem("ds_portal_executions");
      localStorage.removeItem("ds_portal_tools");
      location.reload();
    }
  };

  // ==========================================
  // RESOURCE VIEWER MODAL & DOWNLOADS
  // ==========================================
  window.viewResourceModal = function (type) {
    const modal = document.getElementById("portal-modal");
    const content = document.getElementById("modal-card-content");
    if (!modal || !content) return;

    if (type === "students.txt") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Dataset: students.txt</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <div class="muted small">Local tab-separated dataset loaded into Pandas DataFrame in Experiment 1.</div>
          <div class="output-code-box" style="color: #6ee7b7;">Roll_No\tName\tDepartment\tPercentage
101\tAnusha\tIT\t89
102\tBabitha\tIT\t92
103\tCharitha\tCSE\t88
104\tDeepika\tECE\t85</div>
          <div style="display:flex; justify-content:flex-end; gap: var(--space-2); margin-top: 8px;">
            <button class="btn" onclick="window.downloadDatasetFile('students.txt')">Download File</button>
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    } else if (type === "iris_output.csv") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Dataset: iris_output.csv</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <div class="muted small">Standard 150-record botanical dataset (sepal length, sepal width, petal length, petal width, species).</div>
          <div class="output-code-box" style="max-height: 260px;">sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
4.6,3.1,1.5,0.2,setosa
5.0,3.6,1.4,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
5.5,2.3,4.0,1.3,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
... [150 rows total verified]</div>
          <div style="display:flex; justify-content:flex-end; gap: var(--space-2); margin-top: 8px;">
            <button class="btn" onclick="window.downloadDatasetFile('iris_output.csv')">Download CSV</button>
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    } else if (type === "student.db") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Database Schema: student.db (SQLite)</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <div class="muted small">SQLite relational database with schema and student records preserved.</div>
          <div class="output-code-box" style="color: #93c5fd;">-- 1. Original Experiment 2 Table (Preserved)
CREATE TABLE student (
    id NUMBER,
    name TEXT
);
-- Data: [(2, 'Joy')]

-- 2. Student Profile Table
CREATE TABLE profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    roll TEXT NOT NULL,
    section TEXT NOT NULL,
    branch TEXT NOT NULL,
    faculty TEXT NOT NULL,
    github TEXT,
    linkedin TEXT,
    skills TEXT,
    photo TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Lab Executions Table (10 Experiments)
CREATE TABLE executions (
    experiment_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    output_text TEXT,
    output_filename TEXT,
    output_image TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Experiment Tools Table
CREATE TABLE tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    tool_name TEXT NOT NULL,
    category TEXT,
    purpose TEXT NOT NULL
);</div>
          <div style="display:flex; justify-content:flex-end; gap: var(--space-2); margin-top: 8px;">
            <button class="btn" onclick="window.downloadDatasetFile('student.db')">Download DB</button>
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    } else if (type === "cheatsheet") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Pandas &amp; NumPy Cheatsheet</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <div class="output-code-box" style="max-height: 320px; color: #a5b4fc;"># 1. Loading & Writing
import pandas as pd
df = pd.read_csv("file.csv")
df.to_csv("output.csv", index=False)

# 2. Inspecting
df.head()
df.info()
df.describe()

# 3. Handling Missing Data
df.isna().sum()
df.dropna(how="any")
df.fillna(0)

# 4. MultiIndex & Reshaping
df_unstacked = s.unstack()
df_stacked = df.stack()
merged = df1.combine_first(df2)

# 5. Outlier Detection with NumPy
import numpy as np
z_scores = (df - df.mean()) / df.std()
outliers = np.abs(z_scores) > 3</div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    } else if (type === "visualization") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Matplotlib &amp; Seaborn Visual Guide</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <div class="output-code-box" style="max-height: 320px; color: #f472b6;">import matplotlib.pyplot as plt
import seaborn as sns

# Line Plot
plt.plot(x, y, color="#22d3ee", linewidth=2)
plt.title("Line Chart")
plt.savefig("line.png", dpi=300)

# Density Histogram
sns.histplot(data, kde=True, color="#6366f1")

# Correlation Heatmap
corr = df.corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlation Matrix")

# Box Plot
sns.boxplot(data=df)</div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    } else if (type === "syllabus") {
      content.innerHTML = `
        <div class="modal-head">
          <h3>Course Syllabus: 22DS102006 Data Science Lab</h3>
          <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
        </div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3); font-size: 13.5px; line-height: 1.6;">
          <div><strong>Course Code:</strong> 22DS102006 &bull; <strong>Credits:</strong> 2</div>
          <div><strong>Prerequisite:</strong> Python Programming &bull; <strong>Branch:</strong> B.Tech Data Science</div>
          <div class="card" style="background: var(--bg-soft); padding: 12px; margin-top: 6px;">
            <strong>Evaluation Scheme:</strong>
            <ul style="margin: 6px 0 0 20px;">
              <li>Continuous Internal Evaluation (CIE): 40 Marks</li>
              <li>Semester End Examination (SEE): 60 Marks</li>
              <li>Lab Executions &amp; Output Verification: Mandatory 10 Experiments</li>
            </ul>
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top: 8px;">
            <button class="btn primary" onclick="window.closeModal()">Close</button>
          </div>
        </div>
      `;
    }
    modal.classList.add("open");
  };

  // Download Dataset File
  window.downloadDatasetFile = function (filename) {
    if (filename === "students.txt") {
      const text = "Roll_No\tName\tDepartment\tPercentage\n101\tAnusha\tIT\t89\n102\tBabitha\tIT\t92\n103\tCharitha\tCSE\t88\n104\tDeepika\tECE\t85";
      downloadTextFile(filename, text);
    } else if (filename === "iris_output.csv") {
      const text = "sepal_length,sepal_width,petal_length,petal_width,species\n5.1,3.5,1.4,0.2,setosa\n4.9,3.0,1.4,0.2,setosa\n4.7,3.2,1.3,0.2,setosa\n7.0,3.2,4.7,1.4,versicolor\n6.4,3.2,4.5,1.5,versicolor\n6.3,3.3,6.0,2.5,virginica\n5.8,2.7,5.1,1.9,virginica";
      downloadTextFile(filename, text);
    } else if (filename === "student.db") {
      const a = document.createElement("a");
      a.href = "assets/datasets/student.db";
      a.download = "student.db";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Downloading student.db database...");
    }
  };

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloading ${filename}...`);
  }

  // ==========================================
  // MODAL: EDIT PROFILE
  // ==========================================
  window.openEditProfileModal = function () {
    const modal = document.getElementById("portal-modal");
    const content = document.getElementById("modal-card-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="modal-head">
        <h3>Edit Student Profile</h3>
        <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
      </div>

      <form id="edit-profile-form" onsubmit="window.handleSaveProfile(event)">
        <!-- Photo Selection -->
        <div class="form-group">
          <label>Profile Photo</label>
          <div style="display: flex; gap: var(--space-3); align-items: center;">
            <img id="profile-preview-img" src="${esc(profile.photo || 'assets/img/student-photo.jpg')}" alt="Preview" 
                 style="width: 64px; height: 64px; border-radius: 12px; object-fit: cover; border: 1px solid var(--line-strong);">
            <div style="flex: 1;">
              <input type="file" id="edit-photo-file" accept="image/*" class="form-input" style="padding: 6px 10px; font-size: 12px;" onchange="window.previewNewPhoto(this)">
              <div class="muted small" style="margin-top: 4px; font-size: 11.5px;">Or specify image URL / path below</div>
            </div>
          </div>
          <input type="text" id="edit-photo" class="form-input" value="${esc(profile.photo || '')}" placeholder="assets/img/student-photo.jpg or image URL" style="margin-top: 4px;">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="edit-name" class="form-input" value="${esc(profile.name || '')}" required>
          </div>
          <div class="form-group">
            <label>Roll Number</label>
            <input type="text" id="edit-roll" class="form-input" value="${esc(profile.roll || '')}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Section</label>
            <input type="text" id="edit-section" class="form-input" value="${esc(profile.section || '')}" required>
          </div>
          <div class="form-group">
            <label>Branch</label>
            <input type="text" id="edit-branch" class="form-input" value="${esc(profile.branch || '')}" required>
          </div>
        </div>

        <div class="form-group">
          <label>Assistant Professor / Faculty Supervisor</label>
          <input type="text" id="edit-faculty" class="form-input" value="${esc(profile.faculty || profile.facultyName || '')}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>GitHub Profile URL</label>
            <input type="url" id="edit-github" class="form-input" value="${esc(profile.github || '')}">
          </div>
          <div class="form-group">
            <label>LinkedIn Profile URL</label>
            <input type="url" id="edit-linkedin" class="form-input" value="${esc(profile.linkedin || '')}">
          </div>
        </div>

        <div class="form-group">
          <label>Skills (Comma-separated)</label>
          <textarea id="edit-skills" class="form-textarea" rows="2" placeholder="Python, Pandas, NumPy, SQLite, Matplotlib...">${esc(profile.skills || '')}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap: var(--space-2); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-3);">
          <button type="button" class="btn" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn primary" id="save-profile-btn">
            Save to Database
          </button>
        </div>
      </form>
    `;

    modal.classList.add("open");
  };

  // Preview chosen photo in Edit Profile modal
  window.previewNewPhoto = function (input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const preview = document.getElementById("profile-preview-img");
        if (preview) preview.src = e.target.result;
        const photoInput = document.getElementById("edit-photo");
        if (photoInput) photoInput.value = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Form submit handler for Edit Profile
  window.handleSaveProfile = async function (e) {
    e.preventDefault();
    const btn = document.getElementById("save-profile-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Saving to Database...";
    }

    const updated = {
      name: document.getElementById("edit-name").value.trim(),
      roll: document.getElementById("edit-roll").value.trim(),
      section: document.getElementById("edit-section").value.trim(),
      branch: document.getElementById("edit-branch").value.trim(),
      faculty: document.getElementById("edit-faculty").value.trim(),
      github: document.getElementById("edit-github").value.trim(),
      linkedin: document.getElementById("edit-linkedin").value.trim(),
      skills: document.getElementById("edit-skills").value.trim(),
      photo: document.getElementById("edit-photo").value.trim()
    };

    await saveProfile(updated);
    window.closeModal();

    // Re-render current page to display new details immediately
    const r = parseRoute();
    const root = document.getElementById("app");
    if (r.name === "profile" || r.name === "student") {
      renderProfile(root);
    } else if (r.name === "home" || r.name === "dashboard") {
      renderHome(root);
    }
  };

  // ==========================================
  // MODAL: VIEW EXECUTION OUTPUT
  // ==========================================
  window.viewExpOutput = function (expId) {
    const exp = executions.find(e => String(e.experiment_id) === String(expId));
    if (!exp) return;

    const modal = document.getElementById("portal-modal");
    const content = document.getElementById("modal-card-content");
    if (!modal || !content) return;

    const numFormatted = String(exp.experiment_id).padStart(2, "0");
    const previewImg = exp.output_image || `assets/img/outputs/exp${exp.experiment_id}-output.svg`;
    const filename = exp.output_filename || `exp${exp.experiment_id}_output.txt`;

    content.innerHTML = `
      <div class="modal-head">
        <div>
          <span class="eyebrow" style="margin:0;">Experiment ${numFormatted}</span>
          <h3 style="margin-top: 2px;">${esc(exp.title)}</h3>
        </div>
        <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
      </div>

      <div class="output-view-body">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap: 8px;">
            <span class="muted small">Status:</span>
            <span class="status-badge status-${(exp.status || 'Completed').toLowerCase().replace(/\s+/g, '')}">${esc(exp.status || 'Completed')}</span>
          </div>
          <span class="muted small" style="font-family: var(--font-mono);">File: ${esc(filename)}</span>
        </div>

        <!-- High-res Graphical Output Preview -->
        <div class="output-image-container">
          <img src="${esc(previewImg)}" alt="Experiment Output Preview" onerror="this.src='assets/img/outputs/exp1-output.svg'">
        </div>

        <!-- Text Log / Console Output -->
        <div>
          <div class="muted small" style="text-transform: uppercase; font-family: var(--font-mono); font-size: 11px; margin-bottom: 4px;">
            Execution Logs &amp; Terminal Output
          </div>
          <div class="output-code-box">${esc(exp.output_text || "Execution completed without log messages.")}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: var(--space-3); border-top: 1px solid var(--line); padding-top: var(--space-3);">
          <button class="btn" onclick="window.openUploadModal(${exp.experiment_id})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload New Output
          </button>
          <button class="btn primary" onclick="window.closeModal()">Close</button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  };

  // ==========================================
  // MODAL: UPLOAD / EDIT EXECUTION OUTPUT
  // ==========================================
  window.openUploadModal = function (expId) {
    const exp = executions.find(e => String(e.experiment_id) === String(expId));
    if (!exp) return;

    const modal = document.getElementById("portal-modal");
    const content = document.getElementById("modal-card-content");
    if (!modal || !content) return;

    const numFormatted = String(exp.experiment_id).padStart(2, "0");
    const previewImg = exp.output_image || `assets/img/outputs/exp${exp.experiment_id}-output.svg`;

    content.innerHTML = `
      <div class="modal-head">
        <div>
          <span class="eyebrow" style="margin:0;">Experiment ${numFormatted}</span>
          <h3 style="margin-top: 2px;">Upload &amp; Update Execution</h3>
        </div>
        <button class="modal-close-btn" onclick="window.closeModal()">&times;</button>
      </div>

      <form id="upload-output-form" onsubmit="window.handleSaveExecution(event, ${exp.experiment_id})">
        <div class="form-row">
          <div class="form-group">
            <label>Execution Status</label>
            <select id="edit-exp-status" class="form-select">
              <option value="Completed" ${exp.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="In Progress" ${exp.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Pending" ${exp.status === 'Pending' ? 'selected' : ''}>Pending</option>
            </select>
          </div>
          <div class="form-group">
            <label>Output Filename</label>
            <input type="text" id="edit-exp-filename" class="form-input" value="${esc(exp.output_filename || `exp${exp.experiment_id}_output.txt`)}">
          </div>
        </div>

        <div class="form-group">
          <label>Upload Output File / Image</label>
          <div class="upload-dropzone" onclick="document.getElementById('output-file-picker').click()">
            <input type="file" id="output-file-picker" accept="image/*,.txt,.csv,.json" style="display:none;" onchange="window.previewUploadedOutput(this)">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-b); margin: 0 auto 8px;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div style="font-weight: 500;">Click to select file or drag &amp; drop</div>
            <div class="muted small" style="margin-top: 4px;">Supports PNG, JPG, SVG, CSV, TXT</div>
          </div>

          <div class="upload-preview-area" id="modal-upload-preview" style="margin-top: 8px;">
            <img src="${esc(previewImg)}" alt="Output Preview" onerror="this.src='assets/img/outputs/exp1-output.svg'">
          </div>
          <input type="hidden" id="edit-exp-image-url" value="${esc(exp.output_image || previewImg)}">
        </div>

        <div class="form-group">
          <label>Execution Output / Terminal Notes</label>
          <textarea id="edit-exp-text" class="form-textarea" rows="4" placeholder="Paste execution output or terminal results...">${esc(exp.output_text || '')}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap: var(--space-2); margin-top: var(--space-4); border-top: 1px solid var(--line); padding-top: var(--space-3);">
          <button type="button" class="btn" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn primary" id="save-exp-btn">
            Save Execution to Database
          </button>
        </div>
      </form>
    `;

    modal.classList.add("open");
  };

  // Preview uploaded file inside the modal
  let pendingUploadedFile = null;
  window.previewUploadedOutput = function (input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      pendingUploadedFile = file;

      // Update filename field
      const filenameInput = document.getElementById("edit-exp-filename");
      if (filenameInput) filenameInput.value = file.name;

      // If image, preview immediately
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
          const previewArea = document.getElementById("modal-upload-preview");
          if (previewArea) {
            previewArea.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:220px; object-fit:contain;">`;
          }
          const hiddenUrl = document.getElementById("edit-exp-image-url");
          if (hiddenUrl) hiddenUrl.value = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // If text/csv file, read content
        const reader = new FileReader();
        reader.onload = e => {
          const textArea = document.getElementById("edit-exp-text");
          if (textArea) textArea.value = e.target.result;
        };
        reader.readAsText(file);
      }
    }
  };

  // Save execution form handler
  window.handleSaveExecution = async function (e, expId) {
    e.preventDefault();
    const btn = document.getElementById("save-exp-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Saving to Database...";
    }

    let outputImageUrl = document.getElementById("edit-exp-image-url").value;
    let outputFilename = document.getElementById("edit-exp-filename").value.trim();

    // If a new file was chosen, upload it through API or data URL
    if (pendingUploadedFile) {
      try {
        const uploaded = await uploadOutputFile(pendingUploadedFile, expId);
        outputImageUrl = uploaded.url;
        outputFilename = uploaded.filename;
      } catch (err) {
        console.warn("Upload handler error:", err);
      }
      pendingUploadedFile = null;
    }

    const updated = {
      experiment_id: expId,
      status: document.getElementById("edit-exp-status").value,
      output_filename: outputFilename,
      output_image: outputImageUrl,
      output_text: document.getElementById("edit-exp-text").value
    };

    await saveExecution(updated);
    window.closeModal();

    // Re-render
    const r = parseRoute();
    const root = document.getElementById("app");
    if (r.name === "executions" || r.name === "labs") {
      renderExecutions(root);
    } else if (r.name === "home") {
      renderHome(root);
    }
  };

  // Close Modal
  window.closeModal = function () {
    const modal = document.getElementById("portal-modal");
    if (modal) modal.classList.remove("open");
    pendingUploadedFile = null;
  };

  // Close modal when clicking on overlay background
  document.addEventListener("click", e => {
    const modal = document.getElementById("portal-modal");
    if (modal && e.target === modal) {
      window.closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") window.closeModal();
  });

  // App Initialization
  async function init() {
    initTheme();
    await initDatabaseState();

    window.addEventListener("hashchange", router);
    router();
  }

  // Launch on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
