FROM rockylinux:9.2

ENV LC_ALL=en_US.utf8
ENV LANG=en_US.utf8

LABEL org.opencontainers.image.source="https://github.com/giovtorres/slurm-docker-cluster" \
      org.opencontainers.image.title="slurm-docker-cluster" \
      org.opencontainers.image.description="Slurm Docker cluster on CentOS 7" \
      org.label-schema.docker.cmd="docker-compose up -d" \
      maintainer="Giovanni Torres"

ARG SLURM_TAG=slurm-22-05-9-1
ARG GOSU_VERSION=1.11

COPY --from=ghcr.io/astral-sh/uv:0.4.20 /uv /bin/uv

RUN set -ex \
    && dnf makecache \
    && dnf -y update \
    && dnf -y install dnf-plugins-core https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm \
    && dnf config-manager --enable epel \
    && dnf config-manager --enable crb \
    && dnf -y install \
       wget \
       bzip2 \
       perl \
       gcc \
       gcc-c++\
       git \
       glibc-langpack-en \
       gnupg \
       make \
       munge \
       munge-devel \
       python39 \
       python3-devel \
       python3-pip \
       mariadb-server \
       mariadb-devel \
       psmisc \
       slurm-contribs \
       bash-completion \
       vim-enhanced \
    && dnf clean all \
    && rm -rf /var/cache/yum \
    && ln -s /usr/bin/python3 /usr/bin/python



RUN set -ex \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-amd64" \
    && wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-amd64.asc" \
    && export GNUPGHOME="$(mktemp -d)" \
    # See https://github.com/tianon/gosu/issues/17#issuecomment-348464529
    && ( gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
      || gpg --keyserver pgp.mit.edu --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
      || gpg --keyserver keyserver.pgp.com --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
      || gpg --keyserver keyserver.ubuntu.com --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
    ) \
    && gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
    && rm -rf "${GNUPGHOME}" /usr/local/bin/gosu.asc \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true

RUN set -x \
    && git clone --depth 1 --branch $SLURM_TAG https://github.com/SchedMD/slurm.git \
    && pushd slurm \
    && ./configure --enable-debug --prefix=/usr --sysconfdir=/etc/slurm \
        --with-mysql_config=/usr/bin  --libdir=/usr/lib64 \
    && make install \
    && install -D -m644 etc/cgroup.conf.example /etc/slurm/cgroup.conf.example \
    && install -D -m644 etc/slurm.conf.example /etc/slurm/slurm.conf.example \
    && install -D -m644 etc/slurmdbd.conf.example /etc/slurm/slurmdbd.conf.example \
    && install -D -m644 contribs/slurm_completion_help/slurm_completion.sh /etc/profile.d/slurm_completion.sh \
    && popd \
    && rm -rf slurm \
    && groupadd -r --gid=1001 slurm \
    && useradd -r -g slurm --uid=1001 slurm \
    && mkdir /etc/sysconfig/slurm \
        /var/spool/slurmd \
        /var/run/slurmd \
        /var/run/slurmdbd \
        /var/lib/slurmd \
        /var/log/slurm \
        /data \
    && touch /var/lib/slurmd/node_state \
        /var/lib/slurmd/front_end_state \
        /var/lib/slurmd/job_state \
        /var/lib/slurmd/resv_state \
        /var/lib/slurmd/trigger_state \
        /var/lib/slurmd/assoc_mgr_state \
        /var/lib/slurmd/assoc_usage \
        /var/lib/slurmd/qos_usage \
        /var/lib/slurmd/fed_mgr_state \
    && chown -R slurm:slurm /var/*/slurm* \
    && /sbin/create-munge-key

COPY --chown=slurm:slurm slurm.conf /etc/slurm/slurm.conf
COPY --chown=slurm:slurm slurmdbd.conf /etc/slurm/slurmdbd.conf

RUN chmod 600 /etc/slurm/slurm.conf
RUN chmod 600 /etc/slurm/slurmdbd.conf

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["slurmdbd"]
