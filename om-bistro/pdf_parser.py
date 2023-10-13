import datetime
import re

from dateutil.parser import parse
from pdfquery import PDFQuery
from pyopenmensa.feed import LazyBuilder

days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]


def get_text_until_next_day(pdf, day_label):
    try:
        query = f"LTTextLineHorizontal:contains('{day_label}')"
        day_element = pdf.pq(query)[0]
    except IndexError:
        # Try without the first letter, it is sometimes cut off
        query = f"LTTextLineHorizontal:contains('{day_label[1:]}')"
        day_element = pdf.pq(query)[0]

    def is_date_demarker(element):
        text = element.getchildren()[0].text
        for day in [
            *days,
            *[day[1:] for day in days],  # Sometimes the first letter is cut off
            "wechselnden Speisen",
        ]:  # "wechselnden Speisen" is a hacky delimiter for the last day
            if day in text:
                return True
        return False

    current_element = day_element.getnext()
    strings = []
    while not is_date_demarker(current_element):
        for child in current_element.getchildren():
            strings.append(child.text)
        current_element = current_element.getnext()
    return strings


def filter_texts(texts):
    price_regex = r"^\d,\d\d?$"
    for text in texts:
        text = text.strip()
        if text == "":
            continue
        if re.fullmatch(price_regex, text):
            continue
        yield text


def parse_texts_into_meals(texts):
    match = ""
    for text in filter_texts(texts):
        if text.startswith("- "):
            if match != "":
                yield match
                match = ""
            match += text[2:]
            continue
        elif match != "":
            match += " " + text
    if match != "":
        yield match


def get_meals_for_day(pdf, day_label):
    texts = get_text_until_next_day(pdf, day_label)
    return list(parse_texts_into_meals(texts))


def find_monday_date(pdf) -> datetime.date:
    try:
        date_string = (
            pdf.pq("LTTextLineHorizontal:contains('Mittagstisch vom')")[0]
            .getchildren()[0]
            .text
        )
        daterx = r"\d\d\.\d\d"
        first_date = re.findall(daterx, date_string)[0]
        return parse(first_date).date()
    except Exception:
        print("Could not parse date")


def parse_pdf():
    pdf_path = "downloaded.pdf"
    pdf = PDFQuery(pdf_path)
    pdf.load()

    canteen = LazyBuilder()
    canteen.name = "Schraders Bistro"
    canteen.city = "Potsdam"

    current_day = find_monday_date(pdf)

    for day in days:
        try:
            for i, food in enumerate(get_meals_for_day(pdf, day)):
                category = (
                    "Fleischlos" if i == 0 else "Fleischlich"
                )  # Until now, vegetarian food is always first
                canteen.addMeal(current_day, category, food)
        except Exception:
            print(f"Could not parse day {day}")
        current_day = current_day + datetime.timedelta(days=1)

    return canteen.toXMLFeed()


if __name__ == "__main__":
    print(parse_pdf())
