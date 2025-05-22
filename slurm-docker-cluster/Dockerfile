ARG UV_VERSION="0.7.0"

FROM ghcr.io/astral-sh/uv:$UV_VERSION AS uv

FROM debian:bookworm

ARG SLURM_VERSION="24.05.4"
ARG SLURM_USER_UID=990
ARG SLURM_USER_GID=990
ARG MYSQL_CONFIG_VERSION="0.8.34"

COPY --from=uv /uv /bin/uv

RUN set -xe \
	&& apt-get update \
	&& apt-get install -y curl gnupg lsb-release wget
RUN curl -Lo /tmp/mysql-apt-config.deb "https://dev.mysql.com/get/mysql-apt-config_$MYSQL_CONFIG_VERSION-1_all.deb"
RUN set -xe \
	&& dpkg -i /tmp/mysql-apt-config.deb \
	&& env DEBIAN_FRONTEND="noninteractive" dpkg-reconfigure mysql-apt-config \
	&& apt-get update \
	&& apt-get install --yes mysql-server

RUN bash -c "set -xe && for package in 'smd' 'smd-client' 'smd-slurmd' 'smd-slurmctld' 'smd-slurmdbd' 'smd-sview'; do \
	curl -Lo \"/tmp/slurm-\${package}.deb\" https://github.com/scalableminds/slurm-packages/releases/download/${SLURM_VERSION}/slurm-\${package}_${SLURM_VERSION}-1_amd64.deb; \
done"
RUN apt-get install --yes -f /tmp/*.deb
RUN rm /tmp/*

RUN set -xe \
	&& addgroup --gid="$SLURM_USER_GID" slurm \
	&& adduser --system --uid="$SLURM_USER_UID" --ingroup slurm slurm \
    && mkdir -p /etc/sysconfig/slurm \
        /var/spool/slurmd \
        /var/run/slurmd \
        /var/run/slurmdbd \
        /var/lib/slurmd \
        /var/log/slurm \
        /data \
        /run/munge \
    && chown -R slurm:slurm /var/*/slurm* \
    && chown -R munge:munge /run/munge

COPY --chown=slurm:slurm slurm.conf /etc/slurm/slurm.conf
COPY --chown=slurm:slurm slurmdbd.conf /etc/slurm/slurmdbd.conf
RUN chmod 600 /etc/slurm/slurm.conf
RUN chmod 600 /etc/slurm/slurmdbd.conf

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["slurmdbd"]
