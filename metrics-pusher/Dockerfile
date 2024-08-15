FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install --yes python3-requests python3-docker python3-prometheus-client

COPY ./metrics-pusher.py .
COPY ./monitor.py .

CMD [ "python3", "/app/metrics-pusher.py" ]
