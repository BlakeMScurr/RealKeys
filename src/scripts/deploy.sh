ssh -t postgres@melody 'cd ~/transcribely/src/scripts; bash -l'
# TODO: call build.sh as part of the ssh command - doesn't seem to work, as it becomes tied to the current process and dies on exit
# could we make build.sh part of the bash -1 argument? Doesn't seem to work either.