FROM grafana/promtail:main

COPY ./config.yml /etc/promtail/config.yaml

ENTRYPOINT ["promtail", "--config.file=/etc/promtail/config.yaml", "--config.expand-env=true"]
