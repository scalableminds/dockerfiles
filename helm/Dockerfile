FROM alpine:3.6

ENV HELM_VERSION="v2.9.0"

RUN apk add --no-cache bash ca-certificates coreutils curl findutils grep git python3 wget \
    && pip3 install aiohttp github-webhook pyyaml 'ruamel.yaml<=0.15' slackweb \
    && wget http://storage.googleapis.com/kubernetes-helm/helm-${HELM_VERSION}-linux-amd64.tar.gz \
    && tar -xvf helm-${HELM_VERSION}-linux-amd64.tar.gz linux-amd64/helm \
    && mv linux-amd64/helm /usr/local/bin/helm \
    && rm -rf linux-amd64 \
    && rm -f /helm-${HELM_VERSION}-linux-amd64.tar.gz \
    && chmod +x /usr/local/bin/helm

RUN helm version --client
RUN helm init -c
RUN helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com

ENTRYPOINT ["helm"]
