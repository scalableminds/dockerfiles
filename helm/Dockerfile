FROM alpine/helm:3.4.2

RUN apk add --no-cache bash ca-certificates coreutils curl findutils grep git python3 wget openssh build-base python3-dev \	
    && pip3 install aiohttp github-webhook pyyaml ruamel.yaml slackweb \
    && apk del build-base python3-dev

RUN helm version --client
RUN helm init -c
RUN helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com

ENTRYPOINT ["helm"]
