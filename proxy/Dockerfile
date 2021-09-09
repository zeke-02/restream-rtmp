FROM haproxy:2.1

# Install deps, iproute2 iptables
RUN apt-get update && \
    apt-get install -y --no-install-recommends python-pip curl unzip cron socat
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

# Add HAProxy template
ADD fetch-servers.js /fetch-servers.js
ADD package.json /package.json
RUN npm install

COPY lib /lib



# Add HAProxy entrypoint
COPY docker-entrypoint.sh /
COPY proxy.cfg /usr/local/etc/haproxy/haproxy.cfg
RUN chmod a+x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
RUN touch /usr/local/etc/haproxy/states

RUN touch /usr/local/etc/haproxy/ready.txt
RUN touch /usr/local/etc/haproxy/maint.txt


# Copy configs
#COPY haproxy.cfg.template /usr/local/etc/haproxy/haproxy.cfg.template


COPY healthcheck.http /usr/local/etc/haproxy/healthcheck.http

# RUN AWS_ACCESS_KEY_ID=AKIA4GZTQX2WEOZFVQPX
# RUN AWS_SECRET_ACCESS_KEY=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
# RUN AWS_REGION=us-east-1

# Copy scripts
#COPY reload-haproxy.sh /
#RUN chmod a+x /reload-haproxy.sh
#COPY generate-haproxy.sh /
#RUN chmod a+x /generate-haproxy.sh

COPY update-haproxy.sh /
RUN chmod a+x /update-haproxy.sh


COPY frequent-cron.sh /
RUN chmod a+x /frequent-cron.sh

COPY set-streams.js /
RUN chmod a+x /set-streams.js

COPY update-streams.sh /
RUN chmod a+x /update-streams.sh


# COPY update-cron /etc/cron.d/update-haproxy-cron

# Add cron task to reload HAProxy config/bin/bash /update-haproxy.sh
RUN echo "* * * * * /bin/bash /frequent-cron.sh > /proc/1/fd/1 2>/proc/1/fd/2\n" >> /etc/cron.d/update-haproxy-cron
RUN echo "* * * * * /bin/bash /update-streams.sh > /proc/1/fd/1 2>/proc/1/fd/2\n" >> /etc/cron.d/update-haproxy-cron


RUN crontab /etc/cron.d/update-haproxy-cron

EXPOSE 9000
EXPOSE 1935


# Start HAProxy
CMD ["/usr/local/sbin/haproxy", "-W", "-db","-f", "/usr/local/etc/haproxy/haproxy.cfg", "-p", "/var/run/haproxy.pid"]