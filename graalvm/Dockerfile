FROM scalableminds/alpine

ARG GRAALVM_VERSION="1.0.0-rc2"

RUN apk --no-cache add --virtual build ca-certificates curl wget && \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://raw.githubusercontent.com/sgerrand/alpine-pkg-glibc/master/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.27-r0/glibc-2.27-r0.apk && \
    apk add glibc-2.27-r0.apk && \
    curl -Ls "https://github.com/oracle/graal/releases/download/vm-${GRAALVM_VERSION}/graalvm-ce-${GRAALVM_VERSION}-linux-amd64.tar.gz" | \
    tar zx -C /usr/local/ && \
    rm -f /usr/local/graalvm-ce-${GRAALVM_VERSION}/src.zip && \
    ln -s /usr/local/graalvm-ce-${GRAALVM_VERSION} /usr/local/graalvm && \
    apk del build

ENV PATH ${PATH}:/usr/local/graalvm/bin
