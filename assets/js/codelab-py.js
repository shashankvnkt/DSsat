/* Python compatibility shims loaded before the Code Lab boots.
   This file is plain JavaScript; PYTHON_PREAMBLE is a Python source string. */
(function () {
  window.PYLAB_PACKAGES = ["numpy", "pandas", "matplotlib", "micropip"];

  window.PYTHON_PREAMBLE = [
    "import sys, json",
    "# Use a non-interactive backend so plots render to the virtual FS instead of a window.",
    "try:",
    "    import matplotlib",
    "    matplotlib.use('Agg')",
    "except Exception as _e:",
    "    print('matplotlib shim skipped:', _e)",
    "# requests shim (urllib-backed) for environments without the requests package / CORS quirks.",
    "try:",
    "    import requests",
    "except Exception:",
    "    import urllib.request, json",
    "    class _Response:",
    "        def __init__(self, text):",
    "            self.text = text",
    "            self.content = text.encode('utf-8')",
    "        def json(self):",
    "            import json",
    "            return json.loads(self.text)",
    "    class requests:",
    "        @staticmethod",
    "        def get(url, *args, **kwargs):",
    "            with urllib.request.urlopen(url) as _r:",
    "                return _Response(_r.read().decode('utf-8'))",
    "# best-effort install of seaborn (not a core Pyodide package).",
    "try:",
    "    import micropip",
    "    await micropip.install('seaborn')",
    "except Exception as _e:",
    "    print('seaborn install skipped:', _e)",
    "# report availability",
    "for _m in ('numpy','pandas','matplotlib','seaborn'):",
    "    try:",
    "        __import__(_m)",
    "    except Exception as _e:",
    "        print('optional module', _m, 'not available:', _e)",
  ].join("\n");
})();