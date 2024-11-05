FROM debian:bookworm

RUN apt-get update && apt-get install -y ansible git openssh-client

RUN ansible-playbook --version

ENTRYPOINT ["ansible-playbook"]
