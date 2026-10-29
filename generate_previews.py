import os

os.makedirs("assets/img/outputs", exist_ok=True)

# Exp 1 SVG
svg1 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <circle cx="40" cy="40" r="6" fill="#f87171"/>
  <circle cx="58" cy="40" r="6" fill="#fbbf24"/>
  <circle cx="76" cy="40" r="6" fill="#34d399"/>
  <text x="100" y="45" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="13">exp1_roundtrip_verification.py - Tabular Export</text>
  
  <!-- Table Header -->
  <rect x="30" y="80" width="540" height="32" fill="#1c2847" rx="6"/>
  <text x="50" y="101" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Roll_No</text>
  <text x="150" y="101" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Name</text>
  <text x="280" y="101" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Department</text>
  <text x="430" y="101" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Percentage</text>
  
  <!-- Rows -->
  <rect x="30" y="120" width="540" height="30" fill="#121a2e" rx="4"/>
  <text x="50" y="140" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">101</text>
  <text x="150" y="140" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">Anusha</text>
  <text x="280" y="140" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">IT</text>
  <text x="430" y="140" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">89%</text>
  
  <rect x="30" y="156" width="540" height="30" fill="#162039" rx="4"/>
  <text x="50" y="176" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">102</text>
  <text x="150" y="176" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">Babitha</text>
  <text x="280" y="176" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">IT</text>
  <text x="430" y="176" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">92%</text>

  <rect x="30" y="192" width="540" height="30" fill="#121a2e" rx="4"/>
  <text x="50" y="212" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">103</text>
  <text x="150" y="212" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">Charitha</text>
  <text x="280" y="212" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">CSE</text>
  <text x="430" y="212" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">88%</text>

  <rect x="30" y="228" width="540" height="30" fill="#162039" rx="4"/>
  <text x="50" y="248" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">104</text>
  <text x="150" y="248" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">Deepika</text>
  <text x="280" y="248" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">ECE</text>
  <text x="430" y="248" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">85%</text>

  <!-- Status Bar -->
  <rect x="30" y="278" width="540" height="42" fill="#092f25" stroke="#34d399" stroke-width="1" rx="6"/>
  <path d="M48 299 l6 6 l14 -14" stroke="#34d399" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <text x="80" y="303" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="12">SUCCESS: students.txt and iris_output.csv generated cleanly. Delimiter: tab / comma</text>
</svg>'''

# Exp 2 SVG
svg2 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <circle cx="40" cy="40" r="6" fill="#f87171"/>
  <circle cx="58" cy="40" r="6" fill="#fbbf24"/>
  <circle cx="76" cy="40" r="6" fill="#34d399"/>
  <text x="100" y="45" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="13">student.db (SQLite3) + GitHub API REST Ingestion</text>

  <rect x="30" y="75" width="260" height="185" fill="#121a2e" stroke="#22d3ee" stroke-width="1" rx="8"/>
  <text x="45" y="100" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">SQLite Table: 'student'</text>
  <line x1="30" y1="112" x2="290" y2="112" stroke="#233253"/>
  <text x="45" y="132" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">id: INTEGER | name: TEXT</text>
  <rect x="45" y="145" width="230" height="26" fill="#162039" rx="4"/>
  <text x="55" y="162" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">id: 2 | name: "Joy"</text>
  <text x="45" y="200" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11">-> SELECT verified</text>
  <text x="45" y="220" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">-> UPDATE: Alice (id:1)</text>
  <text x="45" y="240" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11">-> DELETE: WHERE id=1</text>

  <rect x="310" y="75" width="260" height="185" fill="#121a2e" stroke="#6366f1" stroke-width="1" rx="8"/>
  <text x="325" y="100" fill="#818cf8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">REST API: GitHub Issues</text>
  <line x1="310" y1="112" x2="570" y2="112" stroke="#233253"/>
  <text x="325" y="132" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">GET /repos/pandas-dev/issues</text>
  <rect x="325" y="145" width="230" height="36" fill="#162039" rx="4"/>
  <text x="335" y="162" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">#10824911: MultiIndex slicing</text>
  <text x="335" y="174" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">status: open | 2026-08-14</text>
  <rect x="325" y="190" width="230" height="36" fill="#162039" rx="4"/>
  <text x="335" y="207" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">#10824890: JSON parser speed</text>
  <text x="335" y="219" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="10">status: open | 2026-08-14</text>

  <rect x="30" y="275" width="540" height="45" fill="#151e36" rx="6"/>
  <text x="45" y="303" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">COMMIT OK: 30 API records parsed, SQLite tables synced with student.db</text>
</svg>'''

# Exp 3 SVG
svg3 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Data Cleaning & Transformation Pipeline</text>

  <!-- Left: Raw with Nulls -->
  <rect x="35" y="80" width="240" height="170" fill="#121a2e" rx="8" stroke="#f87171" stroke-width="1"/>
  <text x="50" y="105" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Raw Data (with NaNs)</text>
  <line x1="35" y1="115" x2="275" y2="115" stroke="#233253"/>
  <text x="50" y="135" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Row 0: [A: 1.0, B: 4.0]</text>
  <text x="50" y="160" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11">Row 1: [A: 2.0, B: NaN] &#x26A0;</text>
  <text x="50" y="185" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11">Row 2: [A: NaN, B: NaN] &#x26A0;</text>
  <text x="50" y="215" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="11">Outliers (|z| &gt; 3): Detected</text>
  <text x="50" y="235" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="11">Regex split: '\s+'</text>

  <!-- Center Arrow -->
  <path d="M 290 165 L 315 165 M 310 158 L 320 165 L 310 172" stroke="#6366f1" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Right: Cleaned Data -->
  <rect x="330" y="80" width="240" height="170" fill="#121a2e" rx="8" stroke="#34d399" stroke-width="1"/>
  <text x="345" y="105" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Cleaned Output (fillna/dropna)</text>
  <line x1="330" y1="115" x2="570" y2="115" stroke="#233253"/>
  <text x="345" y="135" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Row 0: [A: 1.0, B: 4.0]</text>
  <text x="345" y="160" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11">Row 1: [A: 2.0, B: 0.0] &#x2714;</text>
  <text x="345" y="185" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11">Row 2: [A: 0.0, B: 0.0] &#x2714;</text>
  <text x="345" y="215" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11">Gender Map: {M:0, F:1}</text>
  <text x="345" y="235" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11">Tokens: ['This', 'is', 'a', 'test']</text>

  <rect x="35" y="270" width="535" height="48" fill="#151e36" rx="6"/>
  <text x="50" y="300" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">Transformations complete: 100% missing value resolution, zero null leakage.</text>
</svg>'''

# Exp 4 SVG
svg4 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#818cf8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">MultiIndex Hierarchical Slicing &amp; Alignment Matrix</text>

  <rect x="40" y="80" width="240" height="165" fill="#121a2e" rx="8" stroke="#6366f1" stroke-width="1"/>
  <text x="55" y="105" fill="#818cf8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Stacked Series [Letter, ID]</text>
  <text x="55" y="130" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('a', 1) &#x2192;  0.412</text>
  <text x="55" y="150" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('a', 2) &#x2192; -0.891</text>
  <text x="55" y="170" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('b', 1) &#x2192;  1.205</text>
  <text x="55" y="190" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('b', 2) &#x2192; -0.344</text>
  <text x="55" y="210" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('c', 1) &#x2192;  0.119</text>
  <text x="55" y="230" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">('c', 2) &#x2192;  0.982</text>

  <rect x="310" y="80" width="255" height="165" fill="#121a2e" rx="8" stroke="#22d3ee" stroke-width="1"/>
  <text x="325" y="105" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Unstacked 2D Grid [unstack()]</text>
  
  <rect x="325" y="120" width="225" height="24" fill="#1c2847" rx="4"/>
  <text x="340" y="136" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="11">Index \ Level</text>
  <text x="435" y="136" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11">Col 1</text>
  <text x="495" y="136" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11">Col 2</text>

  <text x="340" y="165" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">Row 'a'</text>
  <text x="435" y="165" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11"> 0.412</text>
  <text x="495" y="165" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11">-0.891</text>

  <text x="340" y="190" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">Row 'b'</text>
  <text x="435" y="190" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11"> 1.205</text>
  <text x="495" y="190" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="11">-0.344</text>

  <text x="340" y="215" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">Row 'c'</text>
  <text x="435" y="215" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11"> 0.119</text>
  <text x="495" y="215" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="11"> 0.982</text>

  <rect x="40" y="265" width="525" height="50" fill="#151e36" rx="6"/>
  <text x="55" y="295" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="12">combine_first(): df1.combine_first(df2) successfully patched NaN values from df2.</text>
</svg>'''

# Exp 5 SVG
svg5 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#22d3ee" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Matplotlib &amp; Seaborn Multi-Plot Figure Output</text>

  <!-- Left: Line Plot -->
  <rect x="35" y="80" width="250" height="170" fill="#121a2e" rx="8"/>
  <text x="50" y="105" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">plt.plot(x, y) - Line Plot</text>
  <line x1="55" y1="225" x2="265" y2="225" stroke="#475569" stroke-width="1.5"/>
  <line x1="55" y1="120" x2="55" y2="225" stroke="#475569" stroke-width="1.5"/>
  <path d="M 60 210 L 115 170 L 175 155 L 245 130" stroke="#22d3ee" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="210" r="4" fill="#6366f1"/>
  <circle cx="115" cy="170" r="4" fill="#6366f1"/>
  <circle cx="175" cy="155" r="4" fill="#6366f1"/>
  <circle cx="245" cy="130" r="4" fill="#6366f1"/>
  <text x="210" y="125" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">y=30</text>

  <!-- Right: Seaborn Density + Bars -->
  <rect x="310" y="80" width="255" height="170" fill="#121a2e" rx="8"/>
  <text x="325" y="105" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">sns.histplot(kde=True) + Bar Chart</text>
  <line x1="330" y1="225" x2="545" y2="225" stroke="#475569" stroke-width="1.5"/>
  <rect x="350" y="170" width="28" height="55" fill="rgba(99,102,241,0.6)" rx="2"/>
  <rect x="390" y="140" width="28" height="85" fill="rgba(99,102,241,0.6)" rx="2"/>
  <rect x="430" y="130" width="28" height="95" fill="rgba(99,102,241,0.6)" rx="2"/>
  <rect x="470" y="160" width="28" height="65" fill="rgba(99,102,241,0.6)" rx="2"/>
  <rect x="510" y="195" width="28" height="30" fill="rgba(99,102,241,0.6)" rx="2"/>
  <path d="M 345 220 C 375 190, 410 120, 444 120 C 475 120, 505 180, 545 220" stroke="#f43f5e" stroke-width="2.5" fill="none"/>

  <rect x="35" y="265" width="530" height="50" fill="#151e36" rx="6"/>
  <text x="50" y="295" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">&#x2714; 5 plots saved to disk: line_plot.png, bar_plot.png, density.png, box_plot.png, scatter.png</text>
</svg>'''

# Exp 6 SVG (Correlation Heatmap)
svg6 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#f43f5e" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Exp 6: Pearson Correlation Heatmap (sns.heatmap)</text>

  <!-- Heatmap Matrix -->
  <g transform="translate(100, 75)">
    <!-- Labels -->
    <text x="65" y="15" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Sepal.L</text>
    <text x="135" y="15" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Sepal.W</text>
    <text x="205" y="15" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Petal.L</text>
    <text x="275" y="15" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Petal.W</text>

    <text x="-15" y="55" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="end">Sepal.L</text>
    <text x="-15" y="115" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="end">Sepal.W</text>
    <text x="-15" y="175" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="end">Petal.L</text>
    <text x="-15" y="235" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="end">Petal.W</text>

    <!-- Row 1 -->
    <rect x="50" y="30" width="65" height="50" fill="#dc2626" rx="4"/>
    <text x="82" y="60" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">1.00</text>

    <rect x="120" y="30" width="65" height="50" fill="#3b82f6" rx="4"/>
    <text x="152" y="60" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.11</text>

    <rect x="190" y="30" width="65" height="50" fill="#f87171" rx="4"/>
    <text x="222" y="60" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0.87</text>

    <rect x="260" y="30" width="65" height="50" fill="#ef4444" rx="4"/>
    <text x="292" y="60" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0.82</text>

    <!-- Row 2 -->
    <rect x="50" y="85" width="65" height="50" fill="#3b82f6" rx="4"/>
    <text x="82" y="115" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.11</text>

    <rect x="120" y="85" width="65" height="50" fill="#dc2626" rx="4"/>
    <text x="152" y="115" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">1.00</text>

    <rect x="190" y="85" width="65" height="50" fill="#1d4ed8" rx="4"/>
    <text x="222" y="115" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.42</text>

    <rect x="260" y="85" width="65" height="50" fill="#2563eb" rx="4"/>
    <text x="292" y="115" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.36</text>

    <!-- Row 3 -->
    <rect x="50" y="140" width="65" height="50" fill="#f87171" rx="4"/>
    <text x="82" y="170" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0.87</text>

    <rect x="120" y="140" width="65" height="50" fill="#1d4ed8" rx="4"/>
    <text x="152" y="170" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.42</text>

    <rect x="190" y="140" width="65" height="50" fill="#dc2626" rx="4"/>
    <text x="222" y="170" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">1.00</text>

    <rect x="260" y="140" width="65" height="50" fill="#b91c1c" rx="4"/>
    <text x="292" y="170" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">0.96</text>

    <!-- Row 4 -->
    <rect x="50" y="195" width="65" height="50" fill="#ef4444" rx="4"/>
    <text x="82" y="225" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0.82</text>

    <rect x="120" y="195" width="65" height="50" fill="#2563eb" rx="4"/>
    <text x="152" y="225" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">-0.36</text>

    <rect x="190" y="195" width="65" height="50" fill="#b91c1c" rx="4"/>
    <text x="222" y="225" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">0.96</text>

    <rect x="260" y="195" width="65" height="50" fill="#dc2626" rx="4"/>
    <text x="292" y="225" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" font-weight="bold">1.00</text>
  </g>

  <!-- Colorbar indicator -->
  <rect x="470" y="105" width="16" height="160" fill="url(#grad_corr)" rx="3"/>
  <defs>
    <linearGradient id="grad_corr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <text x="495" y="115" fill="#ef4444" font-family="JetBrains Mono, monospace" font-size="10">+1.0</text>
  <text x="495" y="190" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="10"> 0.0</text>
  <text x="495" y="265" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="10">-1.0</text>
</svg>'''

# Exp 7 SVG (Statistical Inference)
svg7 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Exp 7: Hypothesis Testing &amp; Probability Distributions</text>

  <!-- Bell Curve -->
  <line x1="50" y1="240" x2="550" y2="240" stroke="#475569" stroke-width="1.5"/>
  <line x1="300" y1="90" x2="300" y2="240" stroke="#6366f1" stroke-dasharray="4" stroke-width="1.5"/>
  <text x="305" y="105" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="11">Mean (&#x3BC; = 0)</text>

  <!-- Rejection Regions (T-tail) -->
  <path d="M 440 240 Q 460 235 480 230 Q 520 235 530 240 Z" fill="rgba(248,113,113,0.45)"/>
  <path d="M 70 240 Q 80 235 120 230 Q 140 235 160 240 Z" fill="rgba(248,113,113,0.45)"/>
  
  <!-- Gaussian Curve Path -->
  <path d="M 60 239 C 140 239, 210 90, 300 90 C 390 90, 460 239, 540 239" stroke="#38bdf8" stroke-width="3" fill="none"/>
  
  <line x1="450" y1="180" x2="450" y2="240" stroke="#f87171" stroke-width="2"/>
  <text x="425" y="170" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="10">t_calc = 2.628</text>
  <text x="440" y="260" fill="#f87171" font-family="JetBrains Mono, monospace" font-size="10">&#x3B1; = 0.05</text>

  <rect x="40" y="270" width="520" height="48" fill="#151e36" rx="6"/>
  <text x="55" y="299" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">t = 2.628, p-value = 0.0099 &lt; 0.05. Statistically significant difference observed.</text>
</svg>'''

# Exp 8 SVG (Regression Fit)
svg8 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Exp 8: OLS Multiple Linear Regression Fit (R&#178; = 0.892)</text>

  <!-- Axes -->
  <line x1="70" y1="250" x2="540" y2="250" stroke="#475569" stroke-width="1.5"/>
  <line x1="70" y1="80" x2="70" y2="250" stroke="#475569" stroke-width="1.5"/>
  <text x="510" y="270" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Feature (X)</text>
  <text x="40" y="90" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">Target (Y)</text>

  <!-- Scatter points -->
  <circle cx="100" cy="225" r="4.5" fill="#22d3ee"/>
  <circle cx="130" cy="210" r="4.5" fill="#22d3ee"/>
  <circle cx="160" cy="220" r="4.5" fill="#22d3ee"/>
  <circle cx="190" cy="185" r="4.5" fill="#22d3ee"/>
  <circle cx="220" cy="190" r="4.5" fill="#22d3ee"/>
  <circle cx="250" cy="165" r="4.5" fill="#22d3ee"/>
  <circle cx="280" cy="145" r="4.5" fill="#22d3ee"/>
  <circle cx="320" cy="155" r="4.5" fill="#22d3ee"/>
  <circle cx="350" cy="130" r="4.5" fill="#22d3ee"/>
  <circle cx="390" cy="115" r="4.5" fill="#22d3ee"/>
  <circle cx="430" cy="125" r="4.5" fill="#22d3ee"/>
  <circle cx="470" cy="100" r="4.5" fill="#22d3ee"/>
  <circle cx="510" cy="95" r="4.5" fill="#22d3ee"/>

  <!-- Regression Best-fit Line -->
  <line x1="80" y1="235" x2="520" y2="90" stroke="#f43f5e" stroke-width="3"/>

  <!-- Metrics callout -->
  <rect x="360" y="150" width="180" height="75" fill="#121a2e" stroke="#34d399" stroke-width="1" rx="6"/>
  <text x="375" y="172" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">R&#178; Score: 0.892</text>
  <text x="375" y="193" fill="#e6ecff" font-family="JetBrains Mono, monospace" font-size="11">MSE: 1.432</text>
  <text x="375" y="212" fill="#9aa6c4" font-family="JetBrains Mono, monospace" font-size="11">OLS Fit: y = 2.45x + 15.6</text>

  <rect x="40" y="280" width="520" height="38" fill="#151e36" rx="6"/>
  <text x="55" y="304" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">Trained on 400 samples; high predictive correlation on unseen test data.</text>
</svg>'''

# Exp 9 SVG (Decision Tree & Confusion Matrix)
svg9 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#a855f7" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Exp 9: Supervised Classification - Confusion Matrix &amp; Trees</text>

  <!-- Confusion Matrix Box -->
  <rect x="35" y="75" width="260" height="185" fill="#121a2e" rx="8" stroke="#a855f7" stroke-width="1"/>
  <text x="50" y="100" fill="#c084fc" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Confusion Matrix (3-Class)</text>
  <rect x="120" y="120" width="45" height="35" fill="#065f46" rx="4"/>
  <text x="142" y="142" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">39</text>
  <rect x="170" y="120" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="192" y="142" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">1</text>
  <rect x="220" y="120" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="242" y="142" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0</text>

  <rect x="120" y="160" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="142" y="182" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">2</text>
  <rect x="170" y="160" width="45" height="35" fill="#065f46" rx="4"/>
  <text x="192" y="182" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">36</text>
  <rect x="220" y="160" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="242" y="142" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">2</text>

  <rect x="120" y="200" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="142" y="222" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">0</text>
  <rect x="170" y="200" width="45" height="35" fill="#1f2937" rx="4"/>
  <text x="192" y="222" fill="#9ca3af" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">2</text>
  <rect x="220" y="200" width="45" height="35" fill="#065f46" rx="4"/>
  <text x="242" y="222" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">38</text>

  <!-- Decision Tree Diagram -->
  <rect x="310" y="75" width="255" height="185" fill="#121a2e" rx="8" stroke="#38bdf8" stroke-width="1"/>
  <text x="325" y="100" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="bold">Decision Tree Structure</text>
  
  <rect x="385" y="115" width="105" height="28" fill="#1e293b" stroke="#38bdf8" stroke-width="1" rx="4"/>
  <text x="437" y="133" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">X[2] &lt;= 2.45</text>

  <line x1="410" y1="143" x2="360" y2="175" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="465" y1="143" x2="510" y2="175" stroke="#94a3b8" stroke-width="1.5"/>

  <rect x="325" y="175" width="75" height="26" fill="#065f46" rx="4"/>
  <text x="362" y="192" fill="#a7f3d0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">Class 0</text>

  <rect x="470" y="175" width="85" height="26" fill="#1e293b" stroke="#38bdf8" stroke-width="1" rx="4"/>
  <text x="512" y="192" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">X[3] &lt;= 1.75</text>

  <!-- Metrics -->
  <rect x="35" y="275" width="530" height="45" fill="#151e36" rx="6"/>
  <text x="50" y="303" fill="#34d399" font-family="JetBrains Mono, monospace" font-size="12">Overall Classification Accuracy: 94.2% (Macro F1-Score: 0.938)</text>
</svg>'''

# Exp 10 SVG (Clustering & PCA)
svg10 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="100%" height="100%">
  <rect width="600" height="340" fill="#0d1324" rx="12"/>
  <rect x="20" y="20" width="560" height="40" fill="#151e36" rx="8"/>
  <text x="45" y="45" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="13" font-weight="bold">Exp 10: K-Means Clustering (k=3) &amp; PCA 2D Projection</text>

  <!-- Left: PCA Scatter -->
  <rect x="35" y="75" width="260" height="185" fill="#121a2e" rx="8"/>
  <text x="50" y="98" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="bold">PCA Dimension Reduction</text>
  
  <!-- Cluster 1 (Cyan) -->
  <circle cx="85" cy="180" r="5" fill="#22d3ee"/>
  <circle cx="100" cy="190" r="5" fill="#22d3ee"/>
  <circle cx="90" cy="205" r="5" fill="#22d3ee"/>
  <circle cx="115" cy="185" r="5" fill="#22d3ee"/>
  <circle cx="105" cy="170" r="5" fill="#22d3ee"/>
  <text x="98" y="190" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" font-weight="bold">&#x271A;</text>

  <!-- Cluster 2 (Purple) -->
  <circle cx="180" cy="120" r="5" fill="#a855f7"/>
  <circle cx="195" cy="135" r="5" fill="#a855f7"/>
  <circle cx="210" cy="115" r="5" fill="#a855f7"/>
  <circle cx="170" cy="140" r="5" fill="#a855f7"/>
  <circle cx="190" cy="150" r="5" fill="#a855f7"/>
  <text x="189" y="132" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" font-weight="bold">&#x271A;</text>

  <!-- Cluster 3 (Green) -->
  <circle cx="210" cy="210" r="5" fill="#34d399"/>
  <circle cx="230" cy="225" r="5" fill="#34d399"/>
  <circle cx="245" cy="200" r="5" fill="#34d399"/>
  <circle cx="225" cy="190" r="5" fill="#34d399"/>
  <circle cx="255" cy="215" r="5" fill="#34d399"/>
  <text x="233" y="210" fill="#fff" font-family="JetBrains Mono, monospace" font-size="11" font-weight="bold">&#x271A;</text>

  <!-- Right: Elbow Curve -->
  <rect x="310" y="75" width="255" height="185" fill="#121a2e" rx="8"/>
  <text x="325" y="98" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-size="11" font-weight="bold">Elbow Method (WCSS vs k)</text>
  <line x1="330" y1="230" x2="540" y2="230" stroke="#475569" stroke-width="1.5"/>
  <line x1="330" y1="120" x2="330" y2="230" stroke="#475569" stroke-width="1.5"/>

  <path d="M 345 130 L 385 180 L 425 210 L 465 220 L 505 225" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
  <circle cx="425" cy="210" r="5" fill="#f43f5e"/>
  <text x="435" y="205" fill="#f43f5e" font-family="JetBrains Mono, monospace" font-size="10" font-weight="bold">Elbow at k=3</text>

  <rect x="35" y="275" width="530" height="45" fill="#151e36" rx="6"/>
  <text x="50" y="303" fill="#a5b4fc" font-family="JetBrains Mono, monospace" font-size="12">K-Means converged in 6 iterations. Silhouette score = 0.684.</text>
</svg>'''

svgs = [svg1, svg2, svg3, svg4, svg5, svg6, svg7, svg8, svg9, svg10]

for i, svg in enumerate(svgs, start=1):
    path = f"assets/img/outputs/exp{i}-output.svg"
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated {path}")
