from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import webbrowser


ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
HOST = "127.0.0.1"
DEFAULT_PORT = 8000


class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def find_available_port(start_port):
    for port in range(start_port, start_port + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                probe.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("No available local port found.")


def main():
    if not WEB_DIR.exists():
        raise FileNotFoundError(f"Missing web app folder: {WEB_DIR}")

    port = find_available_port(DEFAULT_PORT)
    url = f"http://{HOST}:{port}"

    with ThreadingHTTPServer((HOST, port), StaticHandler) as server:
        print("EMI Calculator web app is running locally.")
        print(f"Open: {url}")
        print("Press Ctrl+C to stop the server.")
        webbrowser.open(url)
        server.serve_forever()


if __name__ == "__main__":
    main()
