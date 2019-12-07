#!/bin/bash
CURRENT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
PARENT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && cd .. && pwd )
PACKAGE_VERSION=$(node -pe "require('$PARENT_DIR/package.json').version")
IMAGE_TAG=${2:-v$PACKAGE_VERSION}
NAMESPACE=${1:-staging}

read -p "Deploying $IMAGE_TAG to $NAMESPACE. Press [enter] to continue..."

set -x

helm upgrade --install --atomic ms-users-${NAMESPACE} \
  --set "env=$NAMESPACE" \
  --set "image.tag=$IMAGE_TAG" \
  --set "environment.DATABASE_MONGODB_DBNAME=$DATABASE_MONGODB_DBNAME" \
  --set "environment.DATABASE_MONGODB_URI=$DATABASE_MONGODB_URI" \
  --set "environment.JWT_SECRET=$JWT_SECRET" \
  --set "environment.JWT_AUDIENCE=$JWT_AUDIENCE" \
  --set "environment.JWT_ISSUER=$JWT_ISSUER" \
  --namespace $NAMESPACE \
  $CURRENT_DIR/ms-users
