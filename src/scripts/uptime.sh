status_code=$(curl -s -o /dev/null -w "%{http_code}" https://www.realkeys.co)
expected="200"
if [ "$status_code" = "$expected" ]; then
    echo "it's 200!"
else
    echo "Subject: RealKeys is down!" | sendmail blakemscurr@gmail.com
fi