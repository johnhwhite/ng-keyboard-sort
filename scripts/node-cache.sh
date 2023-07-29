#!/usr/bin/env bash

# This script generates a SHA hash of package-lock.json dependencies field.
# It is used to invalidate the node_modules cache when dependencies change.
echo -n node-cache=
jq -r .dependencies package-lock.json | shasum -a 256 | awk '{print $1}'
