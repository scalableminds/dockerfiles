FROM scalableminds/alpine

RUN apk --no-cache add openjdk8

ENV SBT_VERSION 0.13.15

RUN apk --no-cache add bash
SHELL ["/bin/bash", "-c"]

RUN apk --no-cache add --virtual build curl && \
    curl -Ls "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" | \
    tar zx -C /usr/local/ && \
    ln -s /usr/local/sbt-${SBT_VERSION} /usr/local/sbt && \
    apk del build

ENV PATH /usr/local/sbt/bin:${PATH}

RUN mkdir /app && chmod 777 /app
WORKDIR /app/

# this allows to specify a random user via docker:
ENV SBT_OPTS '-Dsbt.global.base=/root/.sbt/  -Dsbt.ivy.home=/root/.ivy2/  -Divy.home=/root/.ivy2/'
RUN sbt sbtVersion # this adds sbt to the cache
RUN chmod -R 777 /root

# for wk:
RUN apk --no-cache add findutils 'postgresql-client~10' yarn
