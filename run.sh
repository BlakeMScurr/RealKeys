#!/usr/bin/env bash

# This shit is a crazy workaround for typescript resolution in sapper
# TODO: FIX PROPERLY PLEEEEASE!!!!!
# TODO: FIX PROPERLY PLEEEEASE!!!!!
# TODO: FIX PROPERLY PLEEEEASE!!!!!
# The problem is that our typescript imports don't work in sapper unless we
# 1: import typescript files using the .ts extension in the import (which is not supposed to be allowed)
# 2: we get the build server running without using typescript first, then we alter files to import typescript

sed -i -e 's/^/<!--/' 'src/routes/[owner]/[lessonID]/record.svelte'
sed -i -e 's/$/-->/' "src/routes/[owner]/[lessonID]/record.svelte"
sed -i -e 's/^/\/\//' "src/routes/ting.ts"
npm run dev &
sleep 10
echo "replacing"
sed -i -e 's/^<!--//' "src/routes/[owner]/[lessonID]/record.svelte"
sed -i -e 's/-->$//' "src/routes/[owner]/[lessonID]/record.svelte"
sed -i -e 's/^\/\///' "src/routes/ting.ts"
rm src/routes/[owner]/[lessonID]/record.svelte-e
rm src/routes/ting.ts-e
