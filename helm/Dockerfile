FROM alpine/helm:2.16.7

apk add --no-cache bash ca-certificates coreutils curl findutils grep git python3 wget openssh \	
    && pip3 install aiohttp github-webhook pyyaml 'ruamel.yaml<=0.15' slackweb

RUN helm version --client
RUN helm init -c
RUN helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com

ENTRYPOINT ["helm"]
