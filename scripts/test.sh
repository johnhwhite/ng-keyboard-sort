#!/usr/bin/env bash

set -eo pipefail

cd "$(dirname "$0")/.."
node scripts/test.js
