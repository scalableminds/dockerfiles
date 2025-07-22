FROM python:3.13.5-slim-bookworm

WORKDIR /python-docker

RUN apt-get update && apt-get install -y poppler-utils tesseract-ocr tesseract-ocr-deu

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV FLASK_APP=openmensa_server

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
