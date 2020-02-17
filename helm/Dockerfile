FROM alpine/helm:2.9.0

RUN helm version --client
RUN helm init -c
RUN helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com

ENTRYPOINT ["helm"]
