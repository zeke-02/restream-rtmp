#!/bin/bash
for ((i=1;i<=6;i++)); do
    /bin/bash /update-haproxy.sh
    sleep 10
done