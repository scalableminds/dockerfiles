ARG PYTHON_VERSION=3.11
ARG UV_VERSION=0.7.6

FROM ghcr.io/astral-sh/uv:$UV_VERSION AS uv
FROM docker.io/python:$PYTHON_VERSION

ARG SLURM_VERSION="24.05.3"
ARG SLUMR_USER_UID=990
ARG SLURM_USER_GID=990

RUN apt-get update && apt-get install -y curl

# Setup Slurm User
RUN addgroup --gid "$SLURM_USER_GID" slurm \
    && adduser --system --uid "$SLUMR_USER_UID" --ingroup slurm slurm

# Install Slurm Client
RUN curl -Lo /tmp/slurm-smd.deb "https://github.com/scalableminds/slurm-packages/releases/download/$SLURM_VERSION/slurm-smd_$SLURM_VERSION-1_amd64.deb" \
    && curl -Lo /tmp/slurm-smd-client.deb "https://github.com/scalableminds/slurm-packages/releases/download/$SLURM_VERSION/slurm-smd-client_$SLURM_VERSION-1_amd64.deb" \
    && apt-get install --yes -f "/tmp/slurm-smd.deb" "/tmp/slurm-smd-client.deb" \
	&& rm /tmp/slurm-smd.deb /tmp/slurm-smd-client.deb

# Install UV
COPY --from=uv /uv /bin/uv
