FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get upgrade --yes python3-requests

COPY ./metrics-pusher.py .

CMD [ "python3", "/app/metrics-pusher.py" ]
