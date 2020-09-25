#!/usr/bin/env bash
# another shitty utility to tell you which npm to turn off when the server needs resetting (due to what is explained in run.sh)

ps | grep 'npm' | sed -e 's/ tty.*//' | xargs -n1 ps -eo pid,lstart