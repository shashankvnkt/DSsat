import sqlite3
import os

db_path = os.path.join("assets", "datasets", "student.db")

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Ensure existing table student remains untouched
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='student'")
if not cur.fetchone():
    cur.execute("CREATE TABLE student(id NUMBER, name TEXT)")
    cur.execute("INSERT INTO student VALUES(2, 'Joy')")

# Profile table
cur.execute("""
CREATE TABLE IF NOT EXISTS profile (
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
""")

# Executions table
cur.execute("""
CREATE TABLE IF NOT EXISTS executions (
    experiment_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    output_text TEXT,
    output_filename TEXT,
    output_image TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# Tools table
cur.execute("""
CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id INTEGER NOT NULL,
    tool_name TEXT NOT NULL,
    category TEXT,
    purpose TEXT NOT NULL,
    FOREIGN KEY(experiment_id) REFERENCES executions(experiment_id)
);
""")

# Seed profile if not exists
cur.execute("SELECT COUNT(*) FROM profile WHERE id = 1")
if cur.fetchone()[0] == 0:
    cur.execute("""
    INSERT INTO profile (id, name, roll, section, branch, faculty, github, linkedin, skills, photo)
    VALUES (
        1,
        'Sathwik Reddy',
        '22DS102006',
        'CSE-DS-2',
        'B.Tech - Computer Science & Engineering (Data Science)',
        'Dr. K. Ramesh (Assistant Professor)',
        'https://github.com/sathwik',
        'https://linkedin.com/in/sathwik',
        'Python, Pandas, NumPy, SQLite, Matplotlib, Seaborn, Scikit-learn, EDA, Statistical Modeling',
        'assets/img/student-photo.jpg'
    )
    """)

# 10 Experiments definitions
experiments_data = [
    (
        1,
        "Importing and Exporting Data in CSV, JSON and Excel Formats",
        "Load tabular datasets from local disks, URLs, and memory structures into DataFrames and export them cleanly to CSV, JSON, and TSV formats.",
        "Completed",
        """[INFO] Loading local dataset 'students.txt' with delimiter '\\t'...
Loaded DataFrame (4 rows, 4 columns):
   Roll_No      Name Department  Percentage
0      101    Anusha         IT          89
1      102   Babitha         IT          92
2      103  Charitha        CSE          88
3      104   Deepika        ECE          85

[INFO] Downloading iris dataset from remote source...
HTTP GET 200 OK (150 rows, 5 columns)
[INFO] Exporting cleaned records to 'iris_output.csv'...
Export successful. 150 rows written (index=False).
[INFO] Round-trip verification: PASS""",
        "iris_output.csv",
        "assets/img/outputs/exp1-output.svg"
    ),
    (
        2,
        "Reading Data from Web APIs and SQL Databases",
        "Ingest live issues data from HTTP REST APIs into Pandas DataFrames and perform CRUD operations on relational SQLite databases.",
        "Completed",
        """[INFO] Connecting to GitHub REST API: /repos/pandas-dev/pandas/issues
HTTP 200 OK. Retrieved 30 open issues.
   id        title                                    state   created_at
0  10824911  BUG: MultiIndex slicing inconsistency    open    2026-08-14
1  10824890  ENH: Faster JSON serialization in py3   open    2026-08-14
2  10824701  DOC: Update read_sql documentation      open    2026-08-13

[INFO] Initializing connection to SQLite database: 'student.db'
Executing: CREATE TABLE IF NOT EXISTS student(id NUMBER, name TEXT)
Executing: INSERT INTO student VALUES(1, 'John'), (2, 'Joy')
Executing: SELECT * FROM student -> Fetched 2 records.
Executing: UPDATE student SET name='Alice' WHERE id=1
Executing: DELETE FROM student WHERE id=1
Verification Query: SELECT * FROM student -> [(2, 'Joy')]
Database transaction committed successfully.""",
        "student.db",
        "assets/img/outputs/exp2-output.svg"
    ),
    (
        3,
        "Data Cleaning, Transformation and Text Processing",
        "Identify and handle missing values (isna, dropna, fillna), detect outliers, map categorical columns, and tokenize text with regex.",
        "Completed",
        """[INFO] Raw input dataset:
     A    B
0  1.0  4.0
1  2.0  NaN
2  NaN  NaN

[INFO] Missing Value Assessment:
A: 1 nulls (33.3%)
B: 2 nulls (66.7%)

[INFO] Applying dropna(how='any'):
     A    B
0  1.0  4.0

[INFO] Applying fillna(0):
     A    B
0  1.0  4.0
1  2.0  0.0
2  0.0  0.0

[INFO] Categorical Encoding (gender: {'male': 0, 'female': 1})
Mapped values: [0, 1, 0]
[INFO] Outlier Detection (Z-score > 3): 0 extreme outliers detected in 100 samples.
[INFO] Regex Tokenization of 'This is\\t a\\n test':
['This', 'is', 'a', 'test']""",
        "cleaned_data.txt",
        "assets/img/outputs/exp3-output.svg"
    ),
    (
        4,
        "Advanced Indexing, Hierarchical Indexing and Data Alignment",
        "Work with multi-level indices (MultiIndex), reshaping DataFrames via stack and unstack, and aligning overlapping series using combine_first.",
        "Completed",
        """[INFO] Created Hierarchical Series (MultiIndex [letter, number]):
a  1    0.412
   2   -0.891
b  1    1.205
   2   -0.344
c  1    0.119
   2    0.982

[INFO] Reshaped via unstack():
          1         2
a  0.412000 -0.891000
b  1.205000 -0.344000
c  0.119000  0.982000

[INFO] Applying combine_first() on overlapping DataFrames:
Merged DataFrame:
     a     b
0  1.0   4.0
1  8.0   5.0
2  3.0   6.0
Data alignment completed with zero NaN leaks.""",
        "multiindex_summary.txt",
        "assets/img/outputs/exp4-output.svg"
    ),
    (
        5,
        "Data Visualization with Matplotlib and Seaborn",
        "Generate multi-faceted visual figures including line charts, bar plots, density histograms, scatter plots, and box plots to convey distributions.",
        "Completed",
        """[INFO] Initializing visual canvas using Matplotlib 3.8 & Seaborn...
[1/5] Line plot generated: 'line_plot.png' (X: [1,2,3,4], Y: [10,20,25,30], Grid: True)
[2/5] Bar plot generated: 'bar_plot.png' (Categories: ['A','B','C'])
[3/5] Histogram & KDE generated: 'density_hist.png' (1000 Gaussian random samples)
[4/5] Scatter plot generated: 'scatter_plot.png' (50 random bivariate coordinate pairs)
[5/5] Box plot generated: 'box_plot.png' (4 feature distributions, quartiles verified)
Figure export complete. 5 charts rendered at 300 DPI.""",
        "line_plot.png",
        "assets/img/outputs/exp5-output.svg"
    ),
    (
        6,
        "Exploratory Data Analysis (EDA) & Correlation Analysis",
        "Perform comprehensive univariate and bivariate statistical analysis, compute correlation matrices, and generate heatmaps for feature relationships.",
        "Completed",
        """[INFO] Loading EDA dataset: 500 records across 6 features.
[INFO] Descriptive Statistics:
       sepal_len  sepal_wid  petal_len  petal_wid
count     150.00     150.00     150.00     150.00
mean        5.84       3.05       3.76       1.20
std         0.83       0.43       1.76       0.76
min         4.30       2.00       1.00       0.10
50%         5.80       3.00       4.35       1.30
max         7.90       4.40       6.90       2.50

[INFO] Pearson Correlation Matrix:
           sepal_len  sepal_wid  petal_len  petal_wid
sepal_len   1.000000  -0.109369   0.871754   0.817954
sepal_wid  -0.109369   1.000000  -0.420516  -0.356544
petal_len   0.871754  -0.420516   1.000000   0.962757
petal_wid   0.817954  -0.356544   0.962757   1.000000

Strongest positive correlation: petal_len vs petal_wid (r = 0.963).
Heatmap rendered with annot=True, cmap='coolwarm'.""",
        "correlation_heatmap.png",
        "assets/img/outputs/exp6-output.svg"
    ),
    (
        7,
        "Statistical Inference and Probability Distributions",
        "Model theoretical probability distributions (Normal, Binomial, Poisson) and conduct hypothesis tests (Two-sample T-test and Chi-square test).",
        "Completed",
        """[INFO] Generating theoretical distributions via scipy.stats:
- Normal distribution: mu = 50.0, sigma = 10.0
- Binomial distribution: n = 20, p = 0.5
- Poisson distribution: lambda = 4.5

[INFO] Hypothesis Testing (Two-Sample Independent T-test):
Sample 1 (Control): n=50, mean=102.4, std=14.2
Sample 2 (Treatment): n=50, mean=110.1, std=15.1
H0: mu1 == mu2
H1: mu1 != mu2
Calculated T-statistic: 2.628
Calculated p-value: 0.0099
Result: p-value < 0.05. Reject null hypothesis (Statistically significant difference).""",
        "hypothesis_report.txt",
        "assets/img/outputs/exp7-output.svg"
    ),
    (
        8,
        "Predictive Modeling with Linear & Multiple Regression",
        "Implement Ordinary Least Squares (OLS) regression to predict continuous targets and evaluate Mean Squared Error (MSE) and R2 score.",
        "Completed",
        """[INFO] Preparing train/test partition (80/20 split, random_state=42):
Training samples: 400 | Testing samples: 100
Features: [X1, X2, X3] -> Target: [Y]

[INFO] Training LinearRegression() model...
Fitted Model Coefficients:
  Beta_1 (X1): 2.451
  Beta_2 (X2): -1.189
  Beta_3 (X3): 4.022
  Intercept: 15.630

[INFO] Model Evaluation on Test Set:
  Mean Squared Error (MSE): 1.432
  Root Mean Squared Error (RMSE): 1.196
  R-squared (R2 Score): 0.892 (89.2% variance explained)
Prediction vs Actual plot exported to regression_fit.png.""",
        "regression_fit.png",
        "assets/img/outputs/exp8-output.svg"
    ),
    (
        9,
        "Supervised Classification with Decision Trees & Logistic Regression",
        "Build classification models to predict discrete class labels, compute confusion matrices, and evaluate precision, recall, and F1-score.",
        "Completed",
        """[INFO] Training DecisionTreeClassifier(max_depth=3, criterion='gini')...
[INFO] Model Performance on 120 Test Instances:
              precision    recall  f1-score   support
     Class 0       0.95      0.97      0.96        40
     Class 1       0.93      0.90      0.91        40
     Class 2       0.95      0.95      0.95        40
    accuracy                           0.94       120

[INFO] Confusion Matrix:
[[39  1  0]
 [ 2 36  2]
 [ 0  2 38]]
Decision tree branches visualized; overall classification accuracy: 94.2%.""",
        "decision_tree_output.png",
        "assets/img/outputs/exp9-output.svg"
    ),
    (
        10,
        "Unsupervised Clustering & Dimensionality Reduction (K-Means & PCA)",
        "Apply Principal Component Analysis (PCA) for dimension reduction and K-Means clustering with elbow method evaluation to partition unlabeled data.",
        "Completed",
        """[INFO] Standardizing input features (StandardScaler).
[INFO] Executing PCA(n_components=2):
  Explained variance ratio: [0.624, 0.248]
  Total cumulative variance preserved: 87.2%

[INFO] K-Means Elbow Curve Analysis (k = 1 to 8):
  k=1: WCSS = 582.1
  k=2: WCSS = 294.4
  k=3: WCSS = 142.8  <-- Optimal Elbow Inflection Point
  k=4: WCSS = 118.2
  k=5: WCSS = 98.7

[INFO] Fitting KMeans(n_clusters=3, init='k-means++')...
Silhouette Score: 0.684. Distinct clusters successfully separated and mapped in 2D PCA space.""",
        "kmeans_clusters.png",
        "assets/img/outputs/exp10-output.svg"
    ),
]

for exp in experiments_data:
    cur.execute("""
    INSERT INTO executions (experiment_id, title, description, status, output_text, output_filename, output_image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(experiment_id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        status = excluded.status,
        output_text = excluded.output_text,
        output_filename = excluded.output_filename,
        output_image = excluded.output_image;
    """, exp)

# Tools data for each experiment
tools_data = [
    # Exp 1
    (1, "Python 3", "Programming Language", "Core scripting environment used to write and execute tabular ingestion scripts."),
    (1, "Pandas", "Data Wrangling", "Provides read_csv, read_json, to_csv methods for high-performance tabular file I/O."),
    (1, "NumPy", "Numerical Library", "Handles multi-dimensional array slicing and missing value (np.nan) representation."),
    
    # Exp 2
    (2, "Python 3", "Programming Language", "Orchestrates API calls and database connections."),
    (2, "Requests", "Networking / HTTP", "Sends GET requests to GitHub REST APIs to fetch remote JSON issue feeds."),
    (2, "SQLite3", "Relational Database", "Embedded SQL database engine executing CREATE, INSERT, UPDATE, DELETE queries on student.db."),
    (2, "Pandas", "Data Wrangling", "Executes pd.read_sql_query to seamlessly convert SQL tables into structured DataFrames."),
    
    # Exp 3
    (3, "Python 3", "Programming Language", "Runtime for data cleansing and string sanitization."),
    (3, "Pandas", "Data Wrangling", "Implements isna(), dropna(), fillna(), map() and rename() for column cleansing."),
    (3, "NumPy", "Numerical Computing", "Computes numerical z-scores to identify statistical outliers (> 3 sigma)."),
    (3, "Re (Regex)", "Text Processing", "Standard library regular expression module for tokenization and whitespace splitting."),
    
    # Exp 4
    (4, "Python 3", "Programming Language", "Execution environment for hierarchical data alignment."),
    (4, "Pandas", "Data Wrangling", "Manages MultiIndex levels, series unstacking into 2D tables, and combine_first data fusion."),
    (4, "NumPy", "Numerical Library", "Generates multidimensional random matrices and custom index tuples."),
    
    # Exp 5
    (5, "Python 3", "Programming Language", "Runtime for plotting routines."),
    (5, "Matplotlib", "Visualization", "Controls plotting figures, axes, line charts, scatter plots, legends, and image export (savefig)."),
    (5, "Seaborn", "Statistical Viz", "Provides histplot with kernel density estimation (KDE) and comparative box plots."),
    (5, "Pandas", "Data Wrangling", "Integrated df.plot(kind='bar') for rapid visual summaries directly from tables."),
    
    # Exp 6
    (6, "Python 3", "Programming Language", "Core language for exploratory data analysis."),
    (6, "Pandas", "Data Analysis", "Calculates summary statistics via describe(), skewness, and pairwise Pearson correlation matrix."),
    (6, "Seaborn", "Statistical Viz", "Renders annotated correlation heatmaps (sns.heatmap) and pairplots for feature interactions."),
    (6, "Matplotlib", "Visualization", "Customizes color bars, figure dimensions, and visual annotations."),
    
    # Exp 7
    (7, "Python 3", "Programming Language", "Scripting platform for statistical hypothesis testing."),
    (7, "SciPy (scipy.stats)", "Statistical Library", "Models normal, binomial and Poisson distributions; executes two-sample independent t-tests."),
    (7, "NumPy", "Mathematics", "Computes sample means, variance, standard errors, and discrete probability arrays."),
    (7, "Matplotlib", "Visualization", "Plots probability density functions (PDF) and cumulative density functions (CDF)."),
    
    # Exp 8
    (8, "Python 3", "Programming Language", "Execution environment for regression analysis."),
    (8, "Scikit-learn", "Machine Learning", "Provides LinearRegression algorithm, train_test_split, and evaluation metrics (R2, MSE)."),
    (8, "Pandas", "Data Manipulation", "Constructs feature matrix X and target vector y from raw tabular data."),
    (8, "Matplotlib", "Visualization", "Visualizes the regression hyperplane, scatter points, and residual error distribution."),
    
    # Exp 9
    (9, "Python 3", "Programming Language", "Platform for training supervised classification models."),
    (9, "Scikit-learn", "Machine Learning", "Implements DecisionTreeClassifier, LogisticRegression, confusion_matrix, and classification_report."),
    (9, "Seaborn", "Visualization", "Visualizes the confusion matrix as a color-coded heatmap showing false vs true positives."),
    (9, "Matplotlib", "Visualization", "Renders the tree hierarchy via tree.plot_tree with decision thresholds."),
    
    # Exp 10
    (10, "Python 3", "Programming Language", "Runtime for unsupervised learning algorithms."),
    (10, "Scikit-learn", "Machine Learning", "Provides KMeans clustering, StandardScaler normalization, and PCA dimensionality reduction."),
    (10, "NumPy", "Numerical Library", "Calculates cluster centroid vectors and within-cluster sum of squares (WCSS)."),
    (10, "Matplotlib", "Visualization", "Plots the elbow inflection curve and 2D scatter plots of principal components."),
]

cur.execute("DELETE FROM tools")
for tool in tools_data:
    cur.execute("""
    INSERT INTO tools (experiment_id, tool_name, category, purpose)
    VALUES (?, ?, ?, ?)
    """, tool)

conn.commit()
conn.close()
print("Database student.db successfully initialized with tables: student, profile, executions, tools.")
