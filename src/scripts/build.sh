cd ../..
git pull origin master
npm run build
echo "finished build"
ps -o ppid= -C "node __sapper__/build" | xargs kill
pgrep -f "node __sapper__/build/" | xargs kill
echo "killed previous server"
src/scripts/run.sh &
echo "started server"