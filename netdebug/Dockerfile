FROM debian:bullseye

RUN  apt-get update \
  && apt-get install -y \
      coreutils \
      curl \
      dnsutils \
      openssh-client \
      rsync \
      bash \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

CMD ["/bin/bash"]