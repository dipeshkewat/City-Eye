import os
import sys

# Ensure backend directory is in sys.path whether executed from repo root or backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.isdir(os.path.join(current_dir, "backend")):
    backend_dir = os.path.join(current_dir, "backend")
else:
    backend_dir = current_dir

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    os.chdir(backend_dir)
except Exception:
    pass

import uvicorn

if __name__ == "__main__":
    port_env = os.environ.get("PORT", "10000")
    try:
        port = int(port_env)
    except ValueError:
        port = 10000
    print(f"Starting CityEye API server on port {port} from {backend_dir}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
