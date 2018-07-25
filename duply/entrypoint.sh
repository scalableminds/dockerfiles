#!/usr/bin/env bash
set -Eeo pipefail # unset variables are catched everywhere

if [ -z "$GPG_PW"   ] || \
   [ -z "$SCHEME"   ] || \
   [ -z "$HOST"     ] || \
   [ -z "$HOSTPATH" ] || \
   [ -z "$USER"     ] || \
   [ -z "$PASSWORD" ]
then
  echo "you need to set more env variables"
  exit 1
fi

envsubst '${GPG_PW} ${SCHEME} ${HOST} ${HOSTPATH} ${USER} ${PASSWORD}' < conf.template > conf

LOGFILE="$(date +%F)-backup-log"
if [ -z "$1" ] || [ "$1" = 'backup' ]; then
    duply project backup_verify_purge --force 2>&1 | tee ${LOGFILE}
    EXIT_CODE=$?
elif [ "$1" = 'restore' ]; then
    duply project $@ -v9 2>&1 | tee ${LOGFILE}
    EXIT_CODE=$?
else
    $@ 2>&1 | tee ${LOGFILE}
    EXIT_CODE=$?
fi

if [ $EXIT_CODE -ne 0 ]; then
    if [ -n "$MAIL_FOR_ERRORS" ]; then
        cat $LOGFILE | mail -s "backup ${HOSTPATH} failed" "$MAIL_FOR_ERRORS"
    fi
    exit $EXIT_CODE
fi
