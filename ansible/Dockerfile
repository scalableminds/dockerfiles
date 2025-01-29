FROM debian:bookworm

RUN apt-get update && apt-get install -y ansible git openssh-client python3-pip \
	&& pip3 install --break-system-packages aiohttp github-webhook pyyaml ruamel.yaml slackweb

RUN ansible-playbook --version

ENTRYPOINT ["ansible-playbook"]
