FROM openjdk:8-jdk

ARG VERSION_SBT="0.13.15"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
  && apt-get install apt-transport-https \
  && echo "deb https://dl.bintray.com/sbt/debian /" > /etc/apt/sources.list.d/sbt.list \
  && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823 \
  && apt-get update \
  && apt-get install -y \
      sbt="${VERSION_SBT}" \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir /app && chmod 777 /app
WORKDIR /app/

# allowing to specify a random user via docker:
ENV SBT_OPTS '-Dsbt.global.base=/root/.sbt/  -Dsbt.ivy.home=/root/.ivy2/  -Divy.home=/root/.ivy2/'
RUN sbt sbtVersion # adding sbt to the cache
RUN chmod -R 777 /root
