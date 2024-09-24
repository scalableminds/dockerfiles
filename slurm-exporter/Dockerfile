ARG GO_VERSION=1.22
ARG SLURM_VERSION=24.05.3

FROM cimg/go:$GO_VERSION AS builder

ARG SLURM_EXPORTER_VERSION=0.20

WORKDIR /build
RUN wget "https://github.com/vpenso/prometheus-slurm-exporter/archive/refs/tags/${SLURM_EXPORTER_VERSION}.zip" && unzip "${SLURM_EXPORTER_VERSION}.zip"
RUN go build -C "prometheus-slurm-exporter-${SLURM_EXPORTER_VERSION}" -o /build/bin/prometheus-slurm-exporter

FROM scalableminds/slurmctl:$SLURM_VERSION

COPY --from=builder /build/bin/prometheus-slurm-exporter  /usr/bin

ENTRYPOINT [ "/usr/bin/prometheus-slurm-exporter" ]
