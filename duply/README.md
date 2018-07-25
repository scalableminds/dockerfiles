# docker-duply

A dockerized duply for backups.

## Usage

```
docker run \
  -v "...:/to_backup" \
  -v "...:/tmp" \
  -e "GPG_PW=..." \
  -e "SCHEME=..." \
  -e "HOST=..." \
  -e "HOSTPATH=..." \
  -e "USER=..." \
  -e "PASSWORD=..." \
  -e "MAIL_FOR_ERRORS=..." \
  --rm \
  scalableminds/duply:branch-master
```
