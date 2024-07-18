# Promtail

## Usage

Run using docker:

```sh
docker run -v /var/run/docker.sock:/var/run/docker.sock \
    -e LOKI_PUSH_URL="<domain>/loki/api/v1/push" \
    -e LOKI_PUSH_USER="<user>" \
    -e LOKI_PUSH_PASSW="<password>" \
    -e DOCKER_HOST="/var/run/docker.sock" \
    -e INSTANCE_NAME="HelloWorld" \
    scalableminds/promtail
```

This will scrape all containers with label `gather.logs=true`.

## Configuration

Environment Variables:

| Name | Description |
|------|-------------|
| `LOKI_PUSH_URL` | URL to push to (e.g. `<domain>/loki/api/v1/push`) |
| `LOKI_PUSH_USER` | User for Basic Auth |
| `LOKI_PUSH_PASSW` | Password for Basic Auth |
| `DOCKER_HOST` | Path to docker host (e.g. `unix:///var/run/docker.sock`) |
| `INSTANCE_NAME` | Name of the instance |
