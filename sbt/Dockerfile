FROM openjdk:8-jdk

ARG VERSION_SBT="0.13.17"

ENV DEBIAN_FRONTEND noninteractive

RUN curl -Ls "https://github.com/sbt/sbt/releases/download/v${VERSION_SBT}/sbt-${VERSION_SBT}.tgz" | \
    tar zx -C /usr/local/ && \
    ln -s /usr/local/sbt-${VERSION_SBT} /usr/local/sbt

ENV PATH /usr/local/sbt/bin:${PATH}

RUN mkdir /app && chmod 777 /app
WORKDIR /app/

# allowing to specify a random user via docker:
ENV SBT_OPTS '-Dsbt.global.base=/root/.sbt/  -Dsbt.ivy.home=/root/.ivy2/  -Divy.home=/root/.ivy2/'
RUN sbt sbtVersion # adding sbt to the cache
RUN chmod -R 777 /root
