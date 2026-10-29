importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let pyodide = null;
let ready = false;

async function boot() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
  });
  const packages = (self.PYLAB_PACKAGES || []);
  for (const p of packages) {
    try { await pyodide.loadPackage(p); }
    catch (e) { self.postMessage({ type: "log", text: "package load warning (" + p + "): " + (e && e.message ? e.message : e) }); }
  }
  try {
    await pyodide.runPythonAsync(self.PYTHON_PREAMBLE || "");
  } catch (e) {
    self.postMessage({ type: "log", text: "preamble error: " + (e && e.message ? e.message : e) });
  }
  ready = true;
  self.postMessage({ type: "ready" });
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  if (msg.type === "init") {
    self.PYLAB_PACKAGES = msg.packages || [];
    self.PYTHON_PREAMBLE = msg.preamble || "";
    try { await boot(); }
    catch (err) {
      self.postMessage({ type: "error", error: (err && err.message) ? err.message : String(err) });
    }
  } else if (msg.type === "run") {
    if (!ready || !pyodide) {
      self.postMessage({ type: "error", error: "interpreter not ready" });
      return;
    }
    let stdout = "";
    let stderr = "";
    pyodide.setStdout({ batched: (s) => { stdout += (stdout && !stdout.endsWith("\n") ? "\n" : "") + s; } });
    pyodide.setStderr({ batched: (s) => { stderr += (stderr && !stderr.endsWith("\n") ? "\n" : "") + s; } });
    try {
      await pyodide.runPythonAsync(msg.code || "");
      self.postMessage({ type: "stdout", text: stdout });
      if (stderr) self.postMessage({ type: "stderr", text: stderr });
      self.postMessage({ type: "done" });
    } catch (err) {
      self.postMessage({ type: "stdout", text: stdout });
      if (stderr) self.postMessage({ type: "stderr", text: stderr });
      self.postMessage({ type: "error", error: (err && err.message) ? err.message : String(err) });
    }
  }
};