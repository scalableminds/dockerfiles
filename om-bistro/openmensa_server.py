import datetime

from flask import Flask, make_response

from pdf_downloader import download_pdf
from pdf_parser import parse_pdf

app = Flask(__name__)

last_download = datetime.date.fromtimestamp(0)

@app.route("/feed")
def feed():
    global last_download
    # limit downloads to once a day
    if last_download is None or last_download != datetime.date.today():
        download_pdf()
        last_download = datetime.date.today()
    return parse_pdf()


@app.route("/health_check")
def health_check():
    return make_response("OK", 200)
