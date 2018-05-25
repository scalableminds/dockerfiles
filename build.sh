#!/usr/bin/env bash
set -Eeuo pipefail

for APP in $(./get_valid_order.sh); do
  cd $APP
	EXTRA_TAGS=""
	if [[ "$CI" == "true" ]]; then
		EXTRA_TAGS="$EXTRA_TAGS -t scalableminds/$APP:${CIRCLE_BRANCH}__${CIRCLE_BUILD_NUM}"
		EXTRA_TAGS="$EXTRA_TAGS -t scalableminds/$APP:${CIRCLE_BRANCH}"
	fi
  docker build \
  	$EXTRA_TAGS \
    -t scalableminds/$APP \
    .
  cd ..
done
