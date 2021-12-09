FROM debian:bullseye

RUN  apt-get update \
  && apt-get install -y \
      coreutils \
      curl \
      duply \
      gettext-base \
      gnupg \
      mailutils \
      openssh-client \
      pwgen \
      python3-boto \
      python3-pip \
      rsync \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
  && pip3 install b2sdk==0.1.8 # duplicity needs old b2sdk version

RUN mkdir -p /root/.duply/project
COPY conf.template /root/.duply/project/conf.template
WORKDIR /root/.duply/project

VOLUME /to_backup
VOLUME /tmp

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD []
