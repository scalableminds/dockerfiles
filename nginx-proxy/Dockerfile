FROM nginxproxy/nginx-proxy

RUN { \
      echo 'proxy_read_timeout 3600s;'; \
      echo 'client_max_body_size 0;'; \
      echo 'gzip on;'; \
      echo 'gzip_types application/xml+rss application/atom+xml application/javascript application/x-javascript application/json application/rss+xml application/vnd.ms-fontobject application/x-font-ttf application/x-web-app-manifest+json application/xhtml+xml application/xml font/opentype image/svg+xml image/x-icon text/css text/plain text/x-component application/octet-stream application/x-protobuf;'; \
    } > /etc/nginx/conf.d/overwrites.conf
