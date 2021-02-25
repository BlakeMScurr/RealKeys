status_code=$(curl -s -o /dev/null -w "%{http_code}" https://www.realkeys.co)
expected="200"
if [ "$status_code" = "$expected" ]; then
    echo "RealKeys is up"
else
    echo "RealKeys is down"
    echo "Subject: RealKeys is down!" | /usr/sbin/sendmail blakemscurr@gmail.com
fi