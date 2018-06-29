FROM alpine:3.6

ENV KUBE_VERSION="v1.7.5"

RUN apk --no-cache add --virtual build curl && \
    curl -Ls -o /usr/local/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/${KUBE_VERSION}/bin/linux/amd64/kubectl && \
    apk del build

RUN apk add --no-cache bash ca-certificates coreutils findutils

RUN chmod +x /usr/local/bin/kubectl

RUN kubectl version --client

ENTRYPOINT ["kubectl"]
