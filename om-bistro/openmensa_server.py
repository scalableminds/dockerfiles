import datetime

from flask import Flask, make_response, Response

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


@app.route("/meta")
def meta():
    xml = """
        <openmensa version="2.1"
           xmlns="http://openmensa.org/open-mensa-v2"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://openmensa.org/open-mensa-v2 http://openmensa.org/open-mensa-v2.xsd">
    <canteen>
    <name>Schraders Bistro</name>
    <address>August-Bebel-Straße 26–53 14482 Potsdam</address>
    <availability>public</availability>
    <feed name="full">
        <url>https://openmensa.scm.io/feed</url>
        <schedule dayOfMonth="*" dayOfWeek="1" hour="8"/>
    </feed>
    </canteen>
    </openmensa>
    """
    return Response(xml, mimetype="text/xml")


@app.route("/health_check")
def health_check():
    return make_response("OK", 200)
