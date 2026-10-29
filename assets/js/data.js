/* Data Science Laboratory Portal - Seed & Default Data */
window.siteData = {
  student: {
    name: "Sathwik Reddy",
    roll: "22DS102006",
    section: "CSE-DS-2",
    branch: "B.Tech Computer Science & Engineering (Data Science)",
    faculty: "Dr. K. Ramesh (Assistant Professor)",
    github: "https://github.com/sathwik",
    linkedin: "https://linkedin.com/in/sathwik",
    skills: "Python, Pandas, NumPy, SQLite, Matplotlib, Seaborn, Scikit-learn, EDA, Statistical Modeling",
    photo: "assets/img/student-photo.jpg"
  },
  experiments: [
    {
      id: 1,
      title: "Importing and Exporting Data in CSV, JSON and Excel Formats",
      description: "Load tabular datasets from local disks, URLs, and memory structures into DataFrames and export them cleanly to CSV, JSON, and TSV formats.",
      status: "Completed",
      tools: ["Python 3", "Pandas", "NumPy"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Core scripting environment used to write and execute tabular ingestion scripts." },
        { name: "Pandas", category: "Data Wrangling", purpose: "Provides read_csv, read_json, to_csv methods for high-performance tabular file I/O." },
        { name: "NumPy", category: "Numerical Library", purpose: "Handles multi-dimensional array slicing and missing value (np.nan) representation." }
      ],
      outputFilename: "iris_output.csv",
      outputImage: "assets/img/outputs/exp1-output.svg",
      outputText: `[INFO] Loading local dataset 'students.txt' with delimiter '\\t'...
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
[INFO] Round-trip verification: PASS`
    },
    {
      id: 2,
      title: "Reading Data from Web APIs and SQL Databases",
      description: "Ingest live issues data from HTTP REST APIs into Pandas DataFrames and perform CRUD operations on relational SQLite databases.",
      status: "Completed",
      tools: ["Python 3", "Requests", "SQLite3", "Pandas"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Orchestrates API calls and database connections." },
        { name: "Requests", category: "Networking / HTTP", purpose: "Sends GET requests to GitHub REST APIs to fetch remote JSON issue feeds." },
        { name: "SQLite3", category: "Relational Database", purpose: "Embedded SQL database engine executing CREATE, INSERT, UPDATE, DELETE queries on student.db." },
        { name: "Pandas", category: "Data Wrangling", purpose: "Executes pd.read_sql_query to seamlessly convert SQL tables into structured DataFrames." }
      ],
      outputFilename: "student.db",
      outputImage: "assets/img/outputs/exp2-output.svg",
      outputText: `[INFO] Connecting to GitHub REST API: /repos/pandas-dev/pandas/issues
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
Database transaction committed successfully.`
    },
    {
      id: 3,
      title: "Data Cleaning, Transformation and Text Processing",
      description: "Identify and handle missing values (isna, dropna, fillna), detect outliers, map categorical columns, and tokenize text with regex.",
      status: "Completed",
      tools: ["Python 3", "Pandas", "NumPy", "Re (Regex)"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Runtime for data cleansing and string sanitization." },
        { name: "Pandas", category: "Data Wrangling", purpose: "Implements isna(), dropna(), fillna(), map() and rename() for column cleansing." },
        { name: "NumPy", category: "Numerical Computing", purpose: "Computes numerical z-scores to identify statistical outliers (> 3 sigma)." },
        { name: "Re (Regex)", category: "Text Processing", purpose: "Standard library regular expression module for tokenization and whitespace splitting." }
      ],
      outputFilename: "cleaned_data.txt",
      outputImage: "assets/img/outputs/exp3-output.svg",
      outputText: `[INFO] Raw input dataset:
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
['This', 'is', 'a', 'test']`
    },
    {
      id: 4,
      title: "Advanced Indexing, Hierarchical Indexing and Data Alignment",
      description: "Work with multi-level indices (MultiIndex), reshaping DataFrames via stack and unstack, and aligning overlapping series using combine_first.",
      status: "Completed",
      tools: ["Python 3", "Pandas", "NumPy"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Execution environment for hierarchical data alignment." },
        { name: "Pandas", category: "Data Wrangling", purpose: "Manages MultiIndex levels, series unstacking into 2D tables, and combine_first data fusion." },
        { name: "NumPy", category: "Numerical Library", purpose: "Generates multidimensional random matrices and custom index tuples." }
      ],
      outputFilename: "multiindex_summary.txt",
      outputImage: "assets/img/outputs/exp4-output.svg",
      outputText: `[INFO] Created Hierarchical Series (MultiIndex [letter, number]):
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
Data alignment completed with zero NaN leaks.`
    },
    {
      id: 5,
      title: "Data Visualization with Matplotlib and Seaborn",
      description: "Generate multi-faceted visual figures including line charts, bar plots, density histograms, scatter plots, and box plots to convey distributions.",
      status: "Completed",
      tools: ["Python 3", "Matplotlib", "Seaborn", "Pandas"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Runtime for plotting routines." },
        { name: "Matplotlib", category: "Visualization", purpose: "Controls plotting figures, axes, line charts, scatter plots, legends, and image export (savefig)." },
        { name: "Seaborn", category: "Statistical Viz", purpose: "Provides histplot with kernel density estimation (KDE) and comparative box plots." },
        { name: "Pandas", category: "Data Wrangling", purpose: "Integrated df.plot(kind='bar') for rapid visual summaries directly from tables." }
      ],
      outputFilename: "line_plot.png",
      outputImage: "assets/img/outputs/exp5-output.svg",
      outputText: `[INFO] Initializing visual canvas using Matplotlib 3.8 & Seaborn...
[1/5] Line plot generated: 'line_plot.png' (X: [1,2,3,4], Y: [10,20,25,30], Grid: True)
[2/5] Bar plot generated: 'bar_plot.png' (Categories: ['A','B','C'])
[3/5] Histogram & KDE generated: 'density_hist.png' (1000 Gaussian random samples)
[4/5] Scatter plot generated: 'scatter_plot.png' (50 random bivariate coordinate pairs)
[5/5] Box plot generated: 'box_plot.png' (4 feature distributions, quartiles verified)
Figure export complete. 5 charts rendered at 300 DPI.`
    },
    {
      id: 6,
      title: "Exploratory Data Analysis (EDA) & Correlation Analysis",
      description: "Perform comprehensive univariate and bivariate statistical analysis, compute correlation matrices, and generate heatmaps for feature relationships.",
      status: "Completed",
      tools: ["Python 3", "Pandas", "Seaborn", "Matplotlib"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Core language for exploratory data analysis." },
        { name: "Pandas", category: "Data Analysis", purpose: "Calculates summary statistics via describe(), skewness, and pairwise Pearson correlation matrix." },
        { name: "Seaborn", category: "Statistical Viz", purpose: "Renders annotated correlation heatmaps (sns.heatmap) and pairplots for feature interactions." },
        { name: "Matplotlib", category: "Visualization", purpose: "Customizes color bars, figure dimensions, and visual annotations." }
      ],
      outputFilename: "correlation_heatmap.png",
      outputImage: "assets/img/outputs/exp6-output.svg",
      outputText: `[INFO] Loading EDA dataset: 500 records across 6 features.
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
Heatmap rendered with annot=True, cmap='coolwarm'.`
    },
    {
      id: 7,
      title: "Statistical Inference and Probability Distributions",
      description: "Model theoretical probability distributions (Normal, Binomial, Poisson) and conduct hypothesis tests (Two-sample T-test and Chi-square test).",
      status: "Completed",
      tools: ["Python 3", "SciPy (scipy.stats)", "NumPy", "Matplotlib"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Scripting platform for statistical hypothesis testing." },
        { name: "SciPy (scipy.stats)", category: "Statistical Library", purpose: "Models normal, binomial and Poisson distributions; executes two-sample independent t-tests." },
        { name: "NumPy", category: "Mathematics", purpose: "Computes sample means, variance, standard errors, and discrete probability arrays." },
        { name: "Matplotlib", category: "Visualization", purpose: "Plots probability density functions (PDF) and cumulative density functions (CDF)." }
      ],
      outputFilename: "hypothesis_report.txt",
      outputImage: "assets/img/outputs/exp7-output.svg",
      outputText: `[INFO] Generating theoretical distributions via scipy.stats:
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
Result: p-value < 0.05. Reject null hypothesis (Statistically significant difference).`
    },
    {
      id: 8,
      title: "Predictive Modeling with Linear & Multiple Regression",
      description: "Implement Ordinary Least Squares (OLS) regression to predict continuous targets and evaluate Mean Squared Error (MSE) and R2 score.",
      status: "Completed",
      tools: ["Python 3", "Scikit-learn", "Pandas", "Matplotlib"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Execution environment for regression analysis." },
        { name: "Scikit-learn", category: "Machine Learning", purpose: "Provides LinearRegression algorithm, train_test_split, and evaluation metrics (R2, MSE)." },
        { name: "Pandas", category: "Data Manipulation", purpose: "Constructs feature matrix X and target vector y from raw tabular data." },
        { name: "Matplotlib", category: "Visualization", purpose: "Visualizes the regression hyperplane, scatter points, and residual error distribution." }
      ],
      outputFilename: "regression_fit.png",
      outputImage: "assets/img/outputs/exp8-output.svg",
      outputText: `[INFO] Preparing train/test partition (80/20 split, random_state=42):
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
Prediction vs Actual plot exported to regression_fit.png.`
    },
    {
      id: 9,
      title: "Supervised Classification with Decision Trees & Logistic Regression",
      description: "Build classification models to predict discrete class labels, compute confusion matrices, and evaluate precision, recall, and F1-score.",
      status: "Completed",
      tools: ["Python 3", "Scikit-learn", "Seaborn", "Matplotlib"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Platform for training supervised classification models." },
        { name: "Scikit-learn", category: "Machine Learning", purpose: "Implements DecisionTreeClassifier, LogisticRegression, confusion_matrix, and classification_report." },
        { name: "Seaborn", category: "Visualization", purpose: "Visualizes the confusion matrix as a color-coded heatmap showing false vs true positives." },
        { name: "Matplotlib", category: "Visualization", purpose: "Renders the tree hierarchy via tree.plot_tree with decision thresholds." }
      ],
      outputFilename: "decision_tree_output.png",
      outputImage: "assets/img/outputs/exp9-output.svg",
      outputText: `[INFO] Training DecisionTreeClassifier(max_depth=3, criterion='gini')...
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
Decision tree branches visualized; overall classification accuracy: 94.2%.`
    },
    {
      id: 10,
      title: "Unsupervised Clustering & Dimensionality Reduction (K-Means & PCA)",
      description: "Apply Principal Component Analysis (PCA) for dimension reduction and K-Means clustering with elbow method evaluation to partition unlabeled data.",
      status: "Completed",
      tools: ["Python 3", "Scikit-learn", "NumPy", "Matplotlib"],
      toolDetails: [
        { name: "Python 3", category: "Programming Language", purpose: "Runtime for unsupervised learning algorithms." },
        { name: "Scikit-learn", category: "Machine Learning", purpose: "Provides KMeans clustering, StandardScaler normalization, and PCA dimensionality reduction." },
        { name: "NumPy", category: "Numerical Library", purpose: "Calculates cluster centroid vectors and within-cluster sum of squares (WCSS)." },
        { name: "Matplotlib", category: "Visualization", purpose: "Plots the elbow inflection curve and 2D scatter plots of principal components." }
      ],
      outputFilename: "kmeans_clusters.png",
      outputImage: "assets/img/outputs/exp10-output.svg",
      outputText: `[INFO] Standardizing input features (StandardScaler).
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
Silhouette Score: 0.684. Distinct clusters successfully separated and mapped in 2D PCA space.`
    }
  ]
};
