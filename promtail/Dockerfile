FROM grafana/promtail:3.0.0

COPY ./config.yml /etc/promtail/config.yaml

ENTRYPOINT ["promtail", "--config.file=/etc/promtail/config.yaml", "--config.expand-env=true"]
