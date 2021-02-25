git pull origin master
npm run build
ps -o ppid= -C "node __sapper__/build" | xargs kill
pgrep -f "node __sapper__/build/" | xargs kill
./run.sh &