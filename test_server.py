import urllib.request
import json
import subprocess
import time
import sys
import os

print("Starting server process...")
proc = subprocess.Popen([sys.executable, "server.py"])
time.sleep(2)

base_url = "http://localhost:8000"

try:
    # 1. Test GET /
    print("\n1. Testing GET / (index.html)...")
    with urllib.request.urlopen(f"{base_url}/") as resp:
        html = resp.read().decode('utf-8')
        assert "DS Lab Portal" in html
        print("-> PASS: index.html served correctly, found 'DS Lab Portal'.")

    # 2. Test GET /api/profile
    print("\n2. Testing GET /api/profile...")
    with urllib.request.urlopen(f"{base_url}/api/profile") as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert data["success"] is True
        profile = data["data"]
        print(f"-> PASS: Got profile for {profile['name']} ({profile['roll']}), branch: {profile['branch']}")

    # 3. Test GET /api/executions
    print("\n3. Testing GET /api/executions...")
    with urllib.request.urlopen(f"{base_url}/api/executions") as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert data["success"] is True
        exps = data["data"]
        assert len(exps) == 10
        print(f"-> PASS: Exactly {len(exps)} lab experiments returned from SQLite database.")

    # 4. Test GET /api/tools
    print("\n4. Testing GET /api/tools...")
    with urllib.request.urlopen(f"{base_url}/api/tools") as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert data["success"] is True
        tools = data["data"]
        print(f"-> PASS: {len(tools)} tool associations returned.")

    # 5. Test POST /api/profile (editing profile)
    print("\n5. Testing POST /api/profile (updating profile details)...")
    update_payload = json.dumps({
        "name": "Sathwik Reddy",
        "roll": "22DS102006",
        "section": "CSE-DS-2",
        "branch": "B.Tech Computer Science & Engineering (Data Science)",
        "faculty": "Dr. K. Ramesh (Assistant Professor)",
        "skills": "Python, Pandas, NumPy, SQLite, Matplotlib, Seaborn, Scikit-learn, EDA"
    }).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/profile", data=update_payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        assert res["success"] is True
        print("-> PASS: Profile successfully updated in database!")

    # 6. Test POST /api/executions (updating execution status)
    print("\n6. Testing POST /api/executions (updating experiment 1)...")
    exp_payload = json.dumps({
        "experiment_id": 1,
        "status": "Completed",
        "output_filename": "iris_output.csv",
        "output_text": "[TEST] Execution validated."
    }).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/executions", data=exp_payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        assert res["success"] is True
        print("-> PASS: Experiment execution successfully updated in database!")

    print("\nALL SERVER & DATABASE API TESTS PASSED SUCCESSFULLY!")

finally:
    proc.terminate()
    proc.wait()
    print("Server stopped cleanly.")
