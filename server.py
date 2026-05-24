import http.server
import socketserver
import os
import sys

# Append workspace directory to system path to import sync.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import sync

PORT = 8000

class AutoSyncHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Auto-run sync pipeline dynamically on home reloads or projects database requests!
        if self.path == "/" or self.path.startswith("/index.html") or self.path == "/projects.json":
            print("\n" + "=" * 60)
            print("[Auto-Sync Dev Server] Re-indexing project folders dynamically...")
            try:
                sync.sync_projects()
            except Exception as e:
                print(f"[Auto-Sync Dev Server] Error running sync: {e}")
            print("=" * 60 + "\n")
        # Local Host override: Serve portfolio.html instead of index.html for index requests!
        if self.path == "/" or self.path == "/index.html":
            self.path = "/portfolio.html"
            
        return super().do_GET()

if __name__ == "__main__":
    # Ensure database is indexed on startup
    try:
        sync.sync_projects()
    except Exception as e:
        print(f"Error on startup sync: {e}")
        
    handler = AutoSyncHTTPRequestHandler
    
    # Configure TCPServer socket to allow immediate port reuse on restart
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\n[Auto-Sync Dev Server] Serving portfolio dynamically at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
