FROM nginxproxy/nginx-proxy

RUN { \
      echo 'proxy_read_timeout 3600s;'; \
      echo 'client_max_body_size 0;'; \
    } > /etc/nginx/conf.d/overwrites.conf
