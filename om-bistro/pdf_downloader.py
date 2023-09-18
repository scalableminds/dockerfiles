import datetime

import requests

# Reference:
# https://ein-anderes-mahl.de/wp-content/uploads/2023/04/Speisen-Schraders-11.09.-15.09.2023.pdf


def get_current_pdf():
    current_week_monday = datetime.date.today() - datetime.timedelta(
        days=datetime.date.today().weekday()
    )
    current_week_friday = current_week_monday + datetime.timedelta(days=4)
    current_week_monday_string = current_week_monday.strftime("%d.%m.")
    current_week_friday_string = current_week_friday.strftime("%d.%m.%Y")
    return f"https://ein-anderes-mahl.de/wp-content/uploads/2023/04/Speisen-Schraders-{current_week_monday_string}-{current_week_friday_string}.pdf"


def download_pdf():
    pdf_url = get_current_pdf()
    r = requests.get(pdf_url)
    with open("downloaded.pdf", "wb") as f:
        f.write(r.content)


if __name__ == "__main__":
    download_pdf()
