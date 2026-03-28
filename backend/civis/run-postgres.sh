#!/usr/bin/env bash

set -a

if [ -f ".env" ]; then
  . ".env"
fi

set +a

./gradlew bootRun --args='--spring.profiles.active=postgres'
