FROM debian:buster

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
      python-boto \
      rsync \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /root/.duply/project
COPY conf.template /root/.duply/project/conf.template
WORKDIR /root/.duply/project

VOLUME /to_backup
VOLUME /tmp

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD []
