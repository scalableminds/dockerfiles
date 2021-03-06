#!/usr/bin/env bash
set -Eeuo pipefail

for APP in $(./get_valid_order.sh); do
  if [ -f $APP/test.sh ]; then
    cd $APP
    echo ""
    echo "####### ${APP} #######"
    echo ""
    ./test.sh
    echo
    cd ..
  fi
done
