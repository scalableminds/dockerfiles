#!/usr/bin/env bash
set -Eeuo pipefail

CI="${CI-false}"

for APP in $(./get_valid_order.sh); do
  echo ""
  echo "####### ${APP} #######"
  echo ""
  cd $APP
  EXTRA_TAGS=""
  if [[ "$CI" == "true" ]]; then
    EXTRA_TAGS="$EXTRA_TAGS -t scalableminds/$APP:${NORMALIZED_CI_BRANCH}__${GITHUB_RUN_ID}"
    EXTRA_TAGS="$EXTRA_TAGS -t scalableminds/$APP:${NORMALIZED_CI_BRANCH}"
  fi
  docker build \
    $EXTRA_TAGS \
    -t scalableminds/$APP \
    .
  cd ..
done
