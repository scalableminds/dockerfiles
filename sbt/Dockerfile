FROM openjdk:8-jdk

ARG VERSION_SBT="0.13.15"
ARG VERSION_NODE="8.x"

ENV DEBIAN_FRONTEND noninteractive

# add node package source
RUN curl -sL "https://deb.nodesource.com/setup_${VERSION_NODE}" | bash -

# add yarn package source
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -

# add sbt package source
RUN echo "deb https://dl.bintray.com/sbt/debian /" > /etc/apt/sources.list.d/sbt.list \
  && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823

# Install sbt, node & build-essentials
RUN apt-get update \
  && apt-get install -y \
      build-essential \
      findutils \
      nodejs \
      postgresql-client \
      sbt="${VERSION_SBT}" \
      yarn \
  # The following packages are necessary to run headless-gl
  && apt-get install -y \
      mesa-utils xvfb libgl1-mesa-dri libglapi-mesa libosmesa6 pkg-config x11proto-xext-dev xserver-xorg-dev libxext-dev libxi-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir /app && chmod 777 /app
WORKDIR /app/

# allowing to specify a random user via docker:
ENV SBT_OPTS '-Dsbt.global.base=/root/.sbt/  -Dsbt.ivy.home=/root/.ivy2/  -Divy.home=/root/.ivy2/'
RUN sbt sbtVersion # adding sbt to the cache
RUN chmod -R 777 /root
