FROM eclipse-temurin:21

ARG VERSION_SBT="1.9.8"
ARG VERSION_SBT_MINOR="1.9"

ENV DEBIAN_FRONTEND noninteractive

RUN curl -Ls "https://github.com/sbt/sbt/releases/download/v${VERSION_SBT}/sbt-${VERSION_SBT}.tgz" | \
    tar zx -C /usr/local/ && \
    ln -s /usr/local/sbt-${VERSION_SBT} /usr/local/sbt

RUN apt-get update && apt-get install apt-transport-https && \
    apt-get update && apt-get install -y build-essential cmake git \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV PATH /usr/local/sbt/bin:${PATH}

RUN mkdir /app && chmod 777 /app
WORKDIR /app/

# allowing to specify a random user via docker:
ENV HOME /root
ENV SBT_OPTS "-Dsbt.global.base=/root/.sbt/${VERSION_SBT_MINOR}  -Dsbt.ivy.home=/tmp/.ivy2/  -Divy.home=/tmp/.ivy2/"
RUN sbt sbtVersion # adding sbt to the cache
RUN chmod -R 777 /root /tmp/.sbt
