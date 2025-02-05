FROM alpine/helm:3.15.2

RUN apk add --no-cache bash ca-certificates coreutils curl findutils grep git python3 py3-pip wget openssh build-base python3-dev ansible \
    && pip3 install --break-system-packages aiohttp github-webhook pyyaml ruamel.yaml slackweb \
    && apk del build-base python3-dev

RUN helm version
RUN helm repo add stable https://charts.helm.sh/stable
RUN helm repo add incubator https://charts.helm.sh/incubator
RUN helm repo list

RUN ansible-playbook --version

ENTRYPOINT ["helm"]
