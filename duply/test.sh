#!/usr/bin/env bash
set -Eeuo pipefail

TEST_GPG_PW="yo_testYO!11!"
TEST_SCHEME="file"
TEST_HOST="/"
TEST_HOSTPATH="/backup_here"
TEST_USER="none"
TEST_PASSWORD="none"

# make tester container to use mounts on CircleCI
docker run \
  --name tester \
  -d \
  -v "/to_backup" \
  -v "$TEST_HOSTPATH" \
  -v "/restore_here" \
  --rm \
  debian:trixie sleep infinity

# deletes the tester container on exit
function cleanup {      
  docker kill tester
}
trap cleanup EXIT

# create dummy data
docker exec tester bash -c 'echo "Backup Me!" > /to_backup/file_to_backup.txt'

# backup
docker run \
  --volumes-from tester \
  -e "GPG_PW=$TEST_GPG_PW" \
  -e "SCHEME=$TEST_SCHEME" \
  -e "HOST=$TEST_HOST" \
  -e "HOSTPATH=$TEST_HOSTPATH" \
  -e "USER=$TEST_USER" \
  -e "PASSWORD=$TEST_PASSWORD" \
  --rm \
  scalableminds/duply

# restore
docker run \
  --volumes-from tester \
  -e "GPG_PW=$TEST_GPG_PW" \
  -e "SCHEME=$TEST_SCHEME" \
  -e "HOST=$TEST_HOST" \
  -e "HOSTPATH=$TEST_HOSTPATH" \
  -e "USER=$TEST_USER" \
  -e "PASSWORD=$TEST_PASSWORD" \
  --rm \
  scalableminds/duply restore /restore_here

# check recovered data
docker exec tester diff -r /to_backup /restore_here
docker exec tester cat /restore_here/file_to_backup.txt
