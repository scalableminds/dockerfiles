#!/usr/bin/env bash
set -Eeuo pipefail

APP="$1"

pushd $APP

if [ -f test.sh ]; then
  ./test.sh
fi

popd
