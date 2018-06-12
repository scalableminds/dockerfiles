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
    echo 'HOTFIX for missing certificates: https://github.com/oracle/graal/issues/378' && \
    ORACLE_JRE_URL='http://download.oracle.com/otn-pub/java/jdk/8u171-b11/512cd62ec5174c3487ac17c61aaa89e8/jdk-8u171-linux-x64.tar.gz' && \
    curl -jkL -H "Cookie: oraclelicense=accept-securebackup-cookie" $ORACLE_JRE_URL | tar -zxvf - --directory /usr/local/graalvm --wildcards "*/jre/lib/security/cacerts" --strip-components 1 && \
    apk del build

ENV PATH ${PATH}:/usr/local/graalvm/bin
