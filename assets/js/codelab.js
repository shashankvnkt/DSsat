(function () {
  "use strict";

  let worker = null;
  let ready = false;
  let originalCode = "";
  let ui = null;
  let running = false;

  function initWorker() {
    if (worker) return;
    worker = new Worker("assets/js/pyodide-worker.js");
    worker.onmessage = (e) => {
      const m = e.data || {};
      switch (m.type) {
        case "ready":
          ready = true;
          if (ui) {
            ui.loader.classList.add("hidden");
            ui.status.textContent = "Python ready";
            ui.status.style.background = "rgba(52,211,153,.15)";
          }
          appendConsole("✓ Python runtime ready.\n", "sys");
          break;
        case "log":
          appendConsole(m.text + "\n", "sys");
          break;
        case "stdout":
          if (m.text) appendConsole(m.text + (m.text.endsWith("\n") ? "" : "\n"), "");
          break;
        case "stderr":
          if (m.text) appendConsole(m.text + (m.text.endsWith("\n") ? "" : "\n"), "err");
          break;
        case "done":
          running = false;
          appendConsole("\n[finished]\n", "sys");
          updateButtons();
          break;
        case "error":
          running = false;
          appendConsole("\n" + (m.error || "error") + "\n", "err");
          updateButtons();
          break;
      }
    };
    worker.onerror = (err) => {
      appendConsole("worker error: " + (err.message || err) + "\n", "err");
    };
    worker.postMessage({
      type: "init",
      packages: window.PYLAB_PACKAGES || [],
      preamble: window.PYTHON_PREAMBLE || "",
    });
  }

  function appendConsole(text, cls) {
    if (!ui) return;
    const span = document.createElement("span");
    if (cls === "err") span.className = "err";
    if (cls === "sys") span.className = "sys";
    span.textContent = text;
    ui.console.appendChild(span);
    ui.console.scrollTop = ui.console.scrollHeight;
  }

  function updateGutter() {
    if (!ui) return;
    const lines = ui.editor.value.split("\n");
    ui.gutter.innerHTML = lines.map((_, i) => "<div>" + (i + 1) + "</div>").join("");
    // sync widths
  }

  function updateButtons() {
    if (!ui) return;
    ui.run.disabled = !ready || running;
    ui.stop.disabled = !running;
  }

  function loadSnippet(code) {
    originalCode = code;
    ui.editor.value = code;
    updateGutter();
    ui.console.innerHTML = "";
    appendConsole("Loaded snippet. Press Run.\n", "sys");
  }

  function runCode() {
    if (!ready || !worker || running) return;
    running = true;
    updateButtons();
    ui.console.innerHTML = "";
    appendConsole(">>> running\n", "sys");
    worker.postMessage({ type: "run", code: ui.editor.value });
  }

  function stopCode() {
    if (!worker) return;
    // terminate and reboot
    try { worker.terminate(); } catch (e) {}
    worker = null;
    ready = false;
    running = false;
    if (ui) {
      ui.loader.classList.remove("hidden");
      ui.status.textContent = "Restarting…";
      ui.status.style.background = "";
    }
    appendConsole("\n[stopped — restarting runtime]\n", "sys");
    setTimeout(() => {
      initWorker();
    }, 100);
  }

  function resetCode() {
    if (!ui) return;
    ui.editor.value = originalCode;
    updateGutter();
    ui.console.innerHTML = "";
    appendConsole("Reset to original.\n", "sys");
  }

  function setup(root) {
    // root is the container already containing markup; bind elements
    ui = {
      root,
      editor: root.querySelector("#lab-editor"),
      gutter: root.querySelector("#lab-gutter"),
      console: root.querySelector("#lab-console"),
      loader: root.querySelector("#lab-loader"),
      status: root.querySelector("#lab-status"),
      run: root.querySelector("#lab-run"),
      stop: root.querySelector("#lab-stop"),
      reset: root.querySelector("#lab-reset"),
      snippets: root.querySelector("#lab-snippets"),
    };
    if (!ui.editor) return;

    // snippets
    if (ui.snippets && window.siteData) {
      ui.snippets.innerHTML = "";
      window.siteData.experiments.forEach((exp) => {
        exp.sections.forEach((sec) => {
          const btn = document.createElement("button");
          btn.className = "section-row";
          btn.type = "button";
          btn.innerHTML = `<span><strong>Exp ${exp.id}${sec.letter}</strong> — ${escape(sec.title)}</span>`;
          btn.addEventListener("click", () => loadSnippet(sec.code));
          ui.snippets.appendChild(btn);
        });
      });
    }

    ui.editor.addEventListener("input", updateGutter);
    ui.editor.addEventListener("scroll", () => {
      ui.gutter.scrollTop = ui.editor.scrollTop;
    });
    ui.editor.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ui.editor.selectionStart, en = ui.editor.selectionEnd;
        ui.editor.value = ui.editor.value.slice(0, s) + "    " + ui.editor.value.slice(en);
        ui.editor.selectionStart = ui.editor.selectionEnd = s + 4;
        updateGutter();
      }
    });
    if (ui.run) ui.run.addEventListener("click", runCode);
    if (ui.stop) ui.stop.addEventListener("click", stopCode);
    if (ui.reset) ui.reset.addEventListener("click", resetCode);

    // default snippet: prefer one that runs without network/file (exp 3-A for this dataset)
    let first = null;
    if (window.siteData) {
      const exp3 = window.siteData.experiments.find((e) => e.id === 3);
      if (exp3 && exp3.sections && exp3.sections.length) first = exp3.sections[0];
      else if (window.siteData.experiments[0] && window.siteData.experiments[0].sections[0]) first = window.siteData.experiments[0].sections[0];
    }
    if (first) {
      loadSnippet(first.code);
      if (ui.status) ui.status.textContent = "Loading Python…";
    }

    initWorker();
    // if worker already ready from previous navigation, we wouldn't track; handle ready flag anyway
  }

  function escape(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  window.CodeLab = { setup, loadSnippet };
})();
