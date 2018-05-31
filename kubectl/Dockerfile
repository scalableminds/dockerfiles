FROM alpine:3.6

ENV KUBE_VERSION="v1.7.5"

ADD https://storage.googleapis.com/kubernetes-release/release/${KUBE_VERSION}/bin/linux/amd64/kubectl /usr/local/bin/kubectl

RUN apk add --no-cache bash ca-certificates coreutils findutils && \
    chmod +x /usr/local/bin/kubectl

RUN kubectl version --client

ENTRYPOINT ["kubectl"]
