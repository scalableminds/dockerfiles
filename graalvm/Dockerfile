FROM scalableminds/alpine

ARG GRAALVM_VERSION="1.0.0-rc2"

RUN apk --allow-untrusted --no-cache \
    -X https://apkproxy.herokuapp.com/andyshinn/alpine-pkg-glibc \
    add glibc glibc-bin

RUN apk --no-cache add --virtual build curl && \
    curl -Ls "https://github.com/oracle/graal/releases/download/vm-${GRAALVM_VERSION}/graalvm-ce-${GRAALVM_VERSION}-linux-amd64.tar.gz" | \
    tar zx -C /usr/local/ && \
    rm -f /usr/local/graalvm-${GRAALVM_VERSION}/src.zip && \
    ln -s /usr/local/graalvm-${GRAALVM_VERSION} /usr/local/graalvm && \
    apk del build

ENV PATH ${PATH}:/usr/local/graalvm/bin

# for wk:
RUN apk --no-cache add 'postgresql-client~10'
