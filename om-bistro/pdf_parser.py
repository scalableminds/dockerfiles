import datetime
import re

from dateutil.parser import parse
from pyopenmensa.feed import LazyBuilder
from pdf2image import convert_from_path
from PIL import Image
import pyocr


def read_image():
    lang = "deu"
    tool = pyocr.get_available_tools()[0]

    txt = tool.image_to_string(
        Image.open("out.png"), lang=lang, builder=pyocr.builders.TextBuilder()
    )
    return txt


def parse_ocr_text(txt):

    # Discard everything before "Montag"
    txt = txt[txt.index("Montag") :]
    # Discard everything after the last day (before "Portionen fleischlos")
    txt = txt[: txt.rindex("Portionen fleischlos")]

    # Split on lines containing a day
    day_offers = re.split(r"\n(?=\w+Montag|Dienstag|Mittwoch|Donnerstag|Freitag)", txt)
    # First line will be the day, the rest will be the offers
    day_offers = [re.split(r"\n", day_offer) for day_offer in day_offers]
    # discard empty lines
    day_offers = [[line for line in day_offer if line] for day_offer in day_offers]
    # discard the day
    day_offers = [day_offer[1:] for day_offer in day_offers]
    # "-" marks the beginning of an offer: add lines without "-" to the previous offer
    # fix this by going through the lines in reverse order
    for i, day_offer in enumerate(day_offers):
        for j in range(len(day_offer) - 1, 0, -1):
            if not day_offer[j].startswith("-"):
                day_offer[j - 1] += " " + day_offer.pop(j)
    
    # Remove leading "-" from offers
    for day_offer in day_offers:
        for i, offer in enumerate(day_offer):
            if offer.startswith("-"):
                day_offer[i] = offer[1:].strip()
   
    # At the end of the line, there is the price in the format "X,X": convert each offer to a tuple (offer, price as float)

    day_offers = [
        [
            (offer[: offer.rindex(" ")], float(offer[offer.rindex(" ") + 1:].replace(",", ".")))
            for offer in day_offer
        ]
        for day_offer in day_offers
    ]

    return day_offers

def find_monday_date(txt):
    # The line "Mittagstisch vom 26.02. - 01.03.2024" contains the date of the monday
    match = re.search(r"Mittagstisch vom ([\d.]+)", txt)
    date_string = match.group(1)
    # Add year to datestring
    date_string += str(datetime.datetime.now().year)
    date = parse(date_string, dayfirst=True)
    # If the date is not a monday, find the next monday
    while date.weekday() != 0:
        date += datetime.timedelta(days=1)

    # datetime to date
    return date.date()

def parse_pdf():
    pdf_path = "downloaded.pdf"
    images = convert_from_path(pdf_path)
    image = images[0]
    image.save("out.png")
    txt = read_image()
    parsed = parse_ocr_text(txt)

    canteen = LazyBuilder()
    canteen.name = "Schraders Bistro"
    canteen.city = "Potsdam"

    current_day = find_monday_date(txt)

    for day in parsed:
        for i, offer in enumerate(day):
            category = "Fleischlos" if i == 0 else "Fleischlich" # Until now, vegetarian food is always first
            food = offer[0]
            price = offer[1]
            canteen.addMeal(current_day, category, food, prices = {"other" : price})
        current_day = current_day + datetime.timedelta(days=1)

    return canteen.toXMLFeed()


if __name__ == "__main__":
    print(parse_pdf())
