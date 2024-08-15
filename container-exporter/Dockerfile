FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install --yes python3-docker python3-prometheus-client
COPY ./monitor.py .

CMD [ "python3", "/app/monitor.py" ]
