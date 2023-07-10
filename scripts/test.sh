#!/usr/bin/env bash

set -eo pipefail

echo '# ng test ng-keyboard-sort'
npx ng test ng-keyboard-sort -c ci | cat
echo '# ng test e2e'
npx ng test e2e -c ci | cat
