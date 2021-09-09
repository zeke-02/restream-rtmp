#!/bin/bash

#echo "HA PROXY ID: " "$(more /var/run/haproxy.pid)"
#echo "HA PROXY FILE: "  "$(cat /var/run/haproxy.pid)"
# Regenerate HAProxy config
/bin/bash /generate-haproxy.sh

#/usr/bin/socat /tmp/socket - <<< "show servers state bk" > /usr/local/etc/haproxy/server_state
echo "show servers state" | socat /tmp/socket - > /usr/local/etc/haproxy/server_state
echo "bk_rtmp file: " "$(more /usr/local/etc/haproxy/server_state)"


# Reload HAProxy config
# sleep 1000
#HA_PROXY_ID=$(more /var/run/haproxy.pid)
if [ ! -f /var/run/haproxy.pid ]; then
    /usr/local/sbin/haproxy -D -f /usr/local/etc/haproxy/haproxy.cfg -p /var/run/haproxy.pid 
else
    /usr/local/sbin/haproxy -D -f /usr/local/etc/haproxy/haproxy.cfg -p /var/run/haproxy.pid -sf $(cat /var/run/haproxy.pid)
fi

#/usr/bin/socat /tmp/socket - <<< "show servers state bk" > /usr/local/etc/haproxy/server_state
echo "show servers state" | socat /tmp/socket - > /usr/local/etc/haproxy/server_state
#service haproxy reload
#kill -USR2 $HA_PROXY_ID
#haproxy reload
#haproxy -f /usr/local/etc/haproxy/haproxy.cfg
#/usr/local/sbin/haproxy
#/usr/local/sbin/haproxy -c -f /usr/local/etc/haproxy/haproxy.cfg
