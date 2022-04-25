#!/usr/bin/env bash
set -e

echo
echo 'About to call bid() on the contract'
echo near call \$CONTRACT bid --account_id \$PLAYER --amount \$MONEY
echo
echo \$CONTRACT is $CONTRACT
echo \$PLAYER is $PLAYER
echo \$MONEY is [ $1 NEAR ] '(the optionally attached amount)'
echo
near call $CONTRACT bid --account_id $PLAYER --amount $MONEY
