#!/bin/bash
for ((i=1;i<=6;i++)); do
    echo "show stat" | /usr/bin/socat - /tmp/socket | /usr/bin/cut -d ',' -f 1,2,5,18,34 > /usr/local/etc/haproxy/show_stat
    /usr/bin/node /set-streams.js
    sleep 10
done