#!/usr/bin/env bash
set -Eeuo pipefail

TEST_GPG_PW="yo_testYO!11!"
TEST_SCHEME="file"
TEST_HOST="/"
TEST_HOSTPATH="/backup_here"
TEST_USER="none"
TEST_PASSWORD="none"

# create temp dir
TMPDIR="$(mktemp -d)"
if [[ ! "$TMPDIR" || ! -d "$TMPDIR" ]]; then
  echo "Could not create temp dir"
  exit 1
fi

# deletes the temp directory on exit
function cleanup {      
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

# create dummy data
mkdir "$TMPDIR"/to_backup "$TMPDIR"/backup_here "$TMPDIR"/tmp
echo "Backup Me!" > "$TMPDIR"/to_backup/file_to_backup.txt

# backup
docker run \
    -v "$TMPDIR/to_backup:/to_backup" \
    -v "$TMPDIR/backup_here:$TEST_HOSTPATH" \
    -v "$TMPDIR/tmp:/tmp" \
    -e "GPG_PW=$TEST_GPG_PW" \
    -e "SCHEME=$TEST_SCHEME" \
    -e "HOST=$TEST_HOST" \
    -e "HOSTPATH=$TEST_HOSTPATH" \
    -e "USER=$TEST_USER" \
    -e "PASSWORD=$TEST_PASSWORD" \
    --rm \
    -ti \
    scalableminds/duply

# restore
mkdir "$TMPDIR"/restore_here
docker run \
    -v "$TMPDIR/restore_here:/restore_here" \
    -v "$TMPDIR/backup_here:$TEST_HOSTPATH" \
    -v "$TMPDIR/tmp:/tmp" \
    -e "GPG_PW=$TEST_GPG_PW" \
    -e "SCHEME=$TEST_SCHEME" \
    -e "HOST=$TEST_HOST" \
    -e "HOSTPATH=$TEST_HOSTPATH" \
    -e "USER=$TEST_USER" \
    -e "PASSWORD=$TEST_PASSWORD" \
    -ti \
    --rm \
    scalableminds/duply restore /restore_here

# check recovered data
diff -r "$TMPDIR"/to_backup "$TMPDIR"/restore_here
cat "$TMPDIR"/restore_here/file_to_backup.txt
