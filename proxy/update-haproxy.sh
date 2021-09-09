#!/bin/bash

#will put current servers state on haproxy to text file
echo "show servers state" | /usr/bin/socat - /tmp/socket > /usr/local/etc/haproxy/server_state

#which servers to spin up and which servers to spin down. 
# ready.txt: mediasrv0, ip0, mediasrv1, ip1 ... 
# maint.txt: mediasrv0, mediasrv1,...
/usr/bin/node /fetch-servers.js /usr/local/etc/haproxy/ready.txt /usr/local/etc/haproxy/maint.txt

echo "$(cat /usr/local/etc/haproxy/ready.txt)"
echo "$(cat /usr/local/etc/haproxy/maint.txt)"

readarray -t new < /usr/local/etc/haproxy/ready.txt
nlen=${#new[@]}

readarray -t maint < /usr/local/etc/haproxy/maint.txt
mlen=${#maint[@]}


if [ "$nlen" != "0" ]; then
    for (( i=0; i<=$nlen-1; i+=2 ))
    do 
        echo "set server bk_rtmp/${new[$i]} addr ${new[$i+1]} port 1935" | /usr/bin/socat - /tmp/socket
        echo "set server bk_rtmp/${new[$i]} state ready" | /usr/bin/socat - /tmp/socket
    done
fi

if [ "$mlen" != "0" ]; then 
    for (( i=0; i<=$mlen-1; i+=2 ))
    do 
        echo "set server bk_rtmp/${maint[$i]} state maint" | /usr/bin/socat - /tmp/socket
        echo "set server bk_rtmp/${maint[$i]} addr 10.0.0.1 port 1935" | /usr/bin/socat - /tmp/socket
    done
fi