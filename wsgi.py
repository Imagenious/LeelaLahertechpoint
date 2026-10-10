"""
WSGI entry point - lets hosts such as PythonAnywhere run the catalogue.
It uses exactly the same request handling as `python server.py`.

PythonAnywhere: in the Web tab, edit the WSGI configuration file so it contains only:

    import sys
    path = "/home/<your-username>/LL-Digital"
    if path not in sys.path:
        sys.path.insert(0, path)
    from wsgi import application
"""
import os
import sys
from http import HTTPStatus

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("SQLITE_JOURNAL", "DELETE")   # safest on network file systems
os.environ.setdefault("COOKIE_SECURE", "1")         # hosted sites run on HTTPS

import server  # noqa: E402

server.init_db()


class EnvironHeaders:
    """Read request headers from a WSGI environ with the same .get() interface as http.server."""

    def __init__(self, environ):
        self.environ = environ

    def get(self, name, default=None):
        key = name.upper().replace("-", "_")
        if key in ("CONTENT_TYPE", "CONTENT_LENGTH"):
            return self.environ.get(key) or default
        return self.environ.get("HTTP_" + key, default)


def application(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET").upper()
    stream = environ.get("wsgi.input")
    req = server.Request(method, environ.get("PATH_INFO") or "/", environ.get("QUERY_STRING", ""),
                         EnvironHeaders(environ), environ.get("REMOTE_ADDR", ""),
                         stream.read if stream else (lambda n: b""))
    code, headers, body = server.handle_request(req)
    try:
        phrase = HTTPStatus(code).phrase
    except ValueError:
        phrase = ""
    start_response("%d %s" % (code, phrase), headers)
    return [b"" if method == "HEAD" else body]


if __name__ == "__main__":
    # Local test of the WSGI app: python wsgi.py  ->  http://localhost:8000
    from wsgiref.simple_server import make_server, WSGIServer
    from socketserver import ThreadingMixIn

    class ThreadingWSGIServer(ThreadingMixIn, WSGIServer):
        daemon_threads = True

    port = int(os.environ.get("PORT", "8000"))
    print("WSGI test server on http://localhost:%d" % port)
    make_server("", port, application, server_class=ThreadingWSGIServer).serve_forever()
