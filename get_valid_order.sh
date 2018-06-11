#!/usr/bin/env bash
set -Eeuo pipefail

# This resolves all internal dependencies between dockerfiles and
# generates a valid order to build them.
#
# This is done by recursively adding all missing dependencies.

pcregrep_alias() {
  if (which pcregrep &> /dev/null); then
    pcregrep "$@"
  else
    grep -P "$@"
  fi
}

# simple list handling:
DEPENDENCIES=""

dependencies_empty() {
  [[ "$DEPENDENCIES" == "" ]]
}

in_dependencies() {
  [[ " $DEPENDENCIES " == *" $1 "* ]]
}

append_dependency() {
  if dependencies_empty; then
    DEPENDENCIES="$1"
  else
    DEPENDENCIES="$DEPENDENCIES $1"
  fi
}

# extract dependencies from Dockerfile:
get_direct_internal_dependencies() {
  pcregrep_alias -o '^FROM scalableminds/\K[^:\s]+' $1/Dockerfile
}

# recursive function:
add_all_dependencies() {
  while read DEP; do
      add_all_dependencies $DEP
  done < <(get_direct_internal_dependencies $1)

  if ! in_dependencies $1; then
    append_dependency $1
  fi
}


for APP in */Dockerfile; do
  APP="${APP%/Dockerfile}"
  add_all_dependencies $APP
done

echo "$DEPENDENCIES"
