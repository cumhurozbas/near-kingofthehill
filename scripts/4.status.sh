#!/usr/bin/env bash
set -e

echo
echo 'power and current bids'
echo "CONTRACT is [ $CONTRACT ]"
echo "OWNER is [ $OWNER ]"
echo "PLAYER is [ $PLAYER ]"
echo
echo \$CONTRACT is $CONTRACT
echo
near call $CONTRACT status --account_id $CONTRACT
