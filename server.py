import http.server
import socketserver
import sqlite3
import json
import os
import mimetypes
import base64
import urllib.parse
from datetime import datetime

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "assets", "datasets", "student.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "assets", "datasets", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class DSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/profile":
            self.handle_get_profile()
        elif path == "/api/executions":
            self.handle_get_executions()
        elif path == "/api/tools":
            self.handle_get_tools()
        elif path == "/api/stats":
            self.handle_get_stats()
        elif path == "/" or path == "/index.html":
            self.serve_file(os.path.join(BASE_DIR, "index.html"), "text/html; charset=utf-8")
        else:
            # Fall back to default file serving
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            data = {}

        if path == "/api/profile":
            self.handle_post_profile(data)
        elif path == "/api/executions":
            self.handle_post_execution(data)
        elif path == "/api/upload":
            self.handle_post_upload(data)
        else:
            self.send_error(404, "Endpoint not found")

    def serve_file(self, file_path, content_type):
        if not os.path.exists(file_path):
            self.send_error(404, "File Not Found")
            return
        with open(file_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, data, status=200):
        res = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(res)))
        self.end_headers()
        self.wfile.write(res)

    def handle_get_profile(self):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM profile WHERE id = 1")
            row = cur.fetchone()
            conn.close()
            if row:
                profile = dict(row)
                self.send_json({"success": True, "data": profile})
            else:
                self.send_json({"success": False, "error": "Profile not found"}, 404)
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_post_profile(self, data):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
            UPDATE profile SET
                name = COALESCE(?, name),
                roll = COALESCE(?, roll),
                section = COALESCE(?, section),
                branch = COALESCE(?, branch),
                faculty = COALESCE(?, faculty),
                github = COALESCE(?, github),
                linkedin = COALESCE(?, linkedin),
                skills = COALESCE(?, skills),
                photo = COALESCE(?, photo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            """, (
                data.get("name"),
                data.get("roll"),
                data.get("section"),
                data.get("branch"),
                data.get("faculty"),
                data.get("github"),
                data.get("linkedin"),
                data.get("skills"),
                data.get("photo")
            ))
            conn.commit()

            cur.execute("SELECT * FROM profile WHERE id = 1")
            updated = dict(cur.fetchone())
            conn.close()
            self.send_json({"success": True, "data": updated})
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_get_executions(self):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT * FROM executions ORDER BY experiment_id ASC")
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            self.send_json({"success": True, "data": rows})
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_post_execution(self, data):
        try:
            exp_id = data.get("experiment_id")
            if not exp_id:
                return self.send_json({"success": False, "error": "Missing experiment_id"}, 400)

            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
            UPDATE executions SET
                status = COALESCE(?, status),
                output_text = COALESCE(?, output_text),
                output_filename = COALESCE(?, output_filename),
                output_image = COALESCE(?, output_image),
                updated_at = CURRENT_TIMESTAMP
            WHERE experiment_id = ?
            """, (
                data.get("status"),
                data.get("output_text"),
                data.get("output_filename"),
                data.get("output_image"),
                exp_id
            ))
            conn.commit()

            cur.execute("SELECT * FROM executions WHERE experiment_id = ?", (exp_id,))
            updated = dict(cur.fetchone())
            conn.close()
            self.send_json({"success": True, "data": updated})
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_get_tools(self):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
            SELECT t.*, e.title as experiment_title
            FROM tools t
            JOIN executions e ON t.experiment_id = e.experiment_id
            ORDER BY t.experiment_id, t.id ASC
            """)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            self.send_json({"success": True, "data": rows})
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_get_stats(self):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT count(*) FROM executions")
            total = cur.fetchone()[0]
            cur.execute("SELECT count(*) FROM executions WHERE status = 'Completed'")
            completed = cur.fetchone()[0]
            conn.close()
            self.send_json({"success": True, "data": {"total": total, "completed": completed}})
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

    def handle_post_upload(self, data):
        try:
            filename = data.get("filename", f"upload_{int(datetime.now().timestamp())}.png")
            file_data_b64 = data.get("data")
            exp_id = data.get("experiment_id")

            if not file_data_b64:
                return self.send_json({"success": False, "error": "Missing file data"}, 400)

            # Strip data url prefix if present
            if "," in file_data_b64:
                file_data_b64 = file_data_b64.split(",", 1)[1]

            file_bytes = base64.b64decode(file_data_b64)
            safe_name = os.path.basename(filename)
            target_path = os.path.join(UPLOAD_DIR, safe_name)
            
            with open(target_path, "wb") as f:
                f.write(file_bytes)

            relative_url = f"assets/datasets/uploads/{safe_name}"

            # Optionally update execution record in database directly
            if exp_id:
                conn = get_db()
                cur = conn.cursor()
                cur.execute("""
                UPDATE executions SET
                    output_filename = ?,
                    output_image = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE experiment_id = ?
                """, (safe_name, relative_url, exp_id))
                conn.commit()
                conn.close()

            self.send_json({
                "success": True,
                "url": relative_url,
                "filename": safe_name
            })
        except Exception as e:
            self.send_json({"success": False, "error": str(e)}, 500)

if __name__ == "__main__":
    print(f"Starting DS Lab Portal server on http://localhost:{PORT}")
    server = socketserver.TCPServer(("", PORT), DSRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
